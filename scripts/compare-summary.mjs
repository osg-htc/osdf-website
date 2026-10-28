#!/usr/bin/env node
/**
 * Compare the website's numbers from the raw xrd-stash records with the same numbers from the
 * osdf-summary indices, before switching the site over.
 *
 * It runs the queries the API routes used to send (copied below) next to the ones they send now
 * (util/summaryQueries.mjs):
 *   - the home page's last-year totals (bytes read, files read)
 *   - for each of the last N calendar months, as the reports page asks for them: bytes read per
 *     day and per directory
 *
 * Complete months should match exactly. The raw side of each month runs to midnight: the reports
 * page asks for the month up to 23:59:59 on its last day, which leaves out the final second, but a
 * summary row is a whole day, so the site's new numbers include that second. The last-year
 * totals and the current month differ a little: the summaries start the year at midnight UTC and
 * lag the raw data by an hour or two.
 *
 * Usage:
 *   node scripts/compare-summary.mjs [--url URL] [--months N] [--no-year] [--dry-run]
 *
 *   --url      Base URL, including any proxy path (default https://gracc.opensciencegrid.org/q)
 *   --months   How many months to check, newest first (default 12, as on the reports page)
 *   --no-year  Skip the last-year totals
 *   --dry-run  Print the requests without sending them
 *
 * Set OPENSEARCH_USER and OPENSEARCH_PASSWORD to use basic auth: the public proxy's anonymous
 * user can't read osdf-summary-* yet. Every request is a read-only search or count; the raw ones
 * scan billions of records, so they run one at a time. For a self-signed certificate (a
 * port-forward), also set NODE_TLS_REJECT_UNAUTHORIZED=0.
 *
 * Exits 0 when every complete month matches, 1 when one doesn't, 2 when a request fails.
 */
import {
  SUMMARY_INDEX, LAST_YEAR, totalReadQuery, filesReadQuery, dailyReadQuery, readByDirectoryQuery
} from '../util/summaryQueries.mjs';

// The alias the API routes queried. The summaries are built from the xrd-stash* pattern, so a
// difference here can also mean the alias and the pattern cover different indices.
const RAW_INDEX = 'xrd-stash';
// Sums of doubles added in a different order can differ in the last few digits.
const TOLERANCE = 1e-9;

// The raw queries as the API routes sent them before the switch.
function rawRangeQuery(gte, lt) {
  return {
    "bool": {
      "must_not": [
        { "terms": { "logical_dirname.keyword": ["unknown directory", "missing directory"] } }
      ],
      "must": [
        { "range": { "@timestamp": { "gte": gte, "lt": lt } } }
      ]
    }
  };
}
const raw = {
  totalRead: (gte, lt) => ({
    "query": rawRangeQuery(gte, lt),
    "aggs": { "read": { "sum": { "field": "read" } } }
  }),
  filesRead: (gte, lt) => ({ "query": rawRangeQuery(gte, lt) }),
  dailyRead: (gte, lt) => ({
    "query": rawRangeQuery(gte, lt),
    "aggs": {
      "bytime": {
        "date_histogram": { "field": "@timestamp", "interval": "day" },
        "aggs": { "read": { "sum": { "field": "read" } } }
      }
    }
  }),
  readByDirectory: (gte, lt) => ({
    "query": rawRangeQuery(gte, lt),
    "aggs": {
      "bydirectory": {
        "terms": { "field": "logical_dirname.keyword", "size": 10000 },
        "aggs": { "read": { "sum": { "field": "read" } } }
      }
    }
  })
};

function parseArgs(argv) {
  const opts = { url: 'https://gracc.opensciencegrid.org/q', months: 12, year: true, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--url') opts.url = argv[++i];
    else if (arg === '--months') opts.months = parseInt(argv[++i], 10);
    else if (arg === '--no-year') opts.year = false;
    else if (arg === '--dry-run') opts.dryRun = true;
    else {
      console.error(`Unknown argument: ${arg}`);
      process.exit(2);
    }
  }
  if (!opts.url || !(opts.months >= 0)) {
    console.error('Usage: node scripts/compare-summary.mjs [--url URL] [--months N] [--no-year] [--dry-run]');
    process.exit(2);
  }
  opts.url = opts.url.replace(/\/+$/, '');
  return opts;
}

const opts = parseArgs(process.argv.slice(2));
const headers = { 'Content-Type': 'application/json' };
if (process.env.OPENSEARCH_USER) {
  const auth = `${process.env.OPENSEARCH_USER}:${process.env.OPENSEARCH_PASSWORD ?? ''}`;
  headers.Authorization = 'Basic ' + Buffer.from(auth).toString('base64');
}

async function post(index, endpoint, body) {
  const path = `/${index}/${endpoint}`;
  if (opts.dryRun) {
    console.log(`  POST ${opts.url}${path}\n  ${JSON.stringify(body)}`);
    return null;
  }
  const started = Date.now();
  let resp;
  try {
    resp = await fetch(opts.url + path, {
      method: 'POST', headers, body: JSON.stringify(body), signal: AbortSignal.timeout(10 * 60 * 1000)
    });
  } catch (err) {
    console.error(`POST ${path} failed: ${err.cause?.message ?? err.message}`);
    process.exit(2);
  }
  const text = await resp.text();
  if (!resp.ok) {
    console.error(`POST ${path} returned HTTP ${resp.status}: ${text.slice(0, 400)}`);
    if (resp.status === 403 && index === SUMMARY_INDEX) {
      console.error('The anonymous user cannot read the summaries yet: set OPENSEARCH_USER and OPENSEARCH_PASSWORD.');
    }
    process.exit(2);
  }
  const result = JSON.parse(text);
  if (result._shards?.failed) {
    console.error(`POST ${path}: ${result._shards.failed} shard(s) failed, so its numbers are incomplete`);
    process.exit(2);
  }
  console.log(`  ${index} ${endpoint} took ${((Date.now() - started) / 1000).toFixed(1)} s`);
  return result;
}

function same(a, b) {
  return a === b || Math.abs(a - b) <= TOLERANCE * Math.max(Math.abs(a), Math.abs(b));
}

function fmt(n) {
  return Math.round(n).toLocaleString('en-US');
}

function pct(a, b) {
  if (a === 0) return b === 0 ? '0%' : 'n/a';
  const p = ((b - a) / a) * 100;
  return `${p >= 0 ? '+' : ''}${p.toPrecision(3)}%`;
}

// Map of bucket key -> read sum, for a terms or date_histogram aggregation.
function readByKey(buckets) {
  return new Map(buckets.map((b) => [b.key, b.read.value]));
}

// Keys whose values differ, worst first.
function differences(rawMap, summaryMap) {
  const keys = new Set([...rawMap.keys(), ...summaryMap.keys()]);
  return [...keys]
    .map((key) => ({ key, raw: rawMap.get(key) ?? 0, summary: summaryMap.get(key) ?? 0 }))
    .filter((d) => !same(d.raw, d.summary))
    .sort((x, y) => Math.abs(y.summary - y.raw) - Math.abs(x.summary - x.raw));
}

function sum(map) {
  let total = 0;
  for (const v of map.values()) total += v;
  return total;
}

// The reports page's periods: the 1st at 00:00 UTC to the last day at 23:59:59 UTC, in seconds.
function monthPeriods(count) {
  const now = new Date();
  const periods = [];
  for (let i = 0; i < count; i++) {
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const end = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0, 23, 59, 59));
    periods.push({
      label: start.toISOString().slice(0, 7),
      start: start.getTime() / 1000,
      end: end.getTime() / 1000,
      current: i === 0
    });
  }
  return periods;
}

async function compareLastYear() {
  console.log(`\n== Last year (home page): raw now-1y..now, summary ${LAST_YEAR.gte}..${LAST_YEAR.lt}`);
  const rawRead = await post(RAW_INDEX, '_search', raw.totalRead('now-1y', 'now'));
  const sumRead = await post(SUMMARY_INDEX, '_search', totalReadQuery(LAST_YEAR.gte, LAST_YEAR.lt));
  const rawFiles = await post(RAW_INDEX, '_count', raw.filesRead('now-1y', 'now'));
  const sumFiles = await post(SUMMARY_INDEX, '_search', filesReadQuery(LAST_YEAR.gte, LAST_YEAR.lt));
  if (opts.dryRun) return;
  const read = [rawRead.aggregations.read.value, sumRead.aggregations.read.value];
  const files = [rawFiles.count, sumFiles.aggregations.files.value];
  console.log(`  bytes read  raw ${fmt(read[0])}  summary ${fmt(read[1])}  ${pct(...read)}`);
  console.log(`  files read  raw ${fmt(files[0])}  summary ${fmt(files[1])}  ${pct(...files)}`);
  console.log('  (expected to differ slightly: the summary adds the rest of the first day and lags at the end)');
}

async function compareMonth(period) {
  const gte = period.start * 1000;
  const lt = period.end * 1000;
  // The reports page stops a second before midnight, which the daily summary rows can't do, so
  // the raw side runs to midnight to compare whole days.
  const rawLt = lt + 1000;
  console.log(`\n== ${period.label}${period.current ? ' (current month: the summary may lag by an hour or two)' : ''}`);
  const rawDaily = await post(RAW_INDEX, '_search', raw.dailyRead(gte, rawLt));
  const sumDaily = await post(SUMMARY_INDEX, '_search', dailyReadQuery(gte, lt));
  const rawDirs = await post(RAW_INDEX, '_search', raw.readByDirectory(gte, rawLt));
  const sumDirs = await post(SUMMARY_INDEX, '_search', readByDirectoryQuery(gte, lt));
  if (opts.dryRun) return true;

  const days = [readByKey(rawDaily.aggregations.bytime.buckets), readByKey(sumDaily.aggregations.bytime.buckets)];
  const dirs = [readByKey(rawDirs.aggregations.bydirectory.buckets), readByKey(sumDirs.aggregations.bydirectory.buckets)];
  const dayDiffs = differences(...days);
  const dirDiffs = differences(...dirs);
  const total = [sum(days[0]), sum(days[1])];

  console.log(`  bytes read  raw ${fmt(total[0])}  summary ${fmt(total[1])}  ${pct(...total)}`);
  console.log(`  days: ${days[0].size} raw, ${days[1].size} summary, ${dayDiffs.length} differ`);
  for (const d of dayDiffs.slice(0, 5)) {
    const day = new Date(d.key).toISOString().slice(0, 10);
    console.log(`    ${day}  raw ${fmt(d.raw)}  summary ${fmt(d.summary)}  ${pct(d.raw, d.summary)}`);
  }
  console.log(`  directories: ${dirs[0].size} raw, ${dirs[1].size} summary, ${dirDiffs.length} differ`);
  for (const d of dirDiffs.slice(0, 5)) {
    console.log(`    ${d.key}  raw ${fmt(d.raw)}  summary ${fmt(d.summary)}  ${pct(d.raw, d.summary)}`);
  }
  for (const [name, result] of [['raw', rawDirs], ['summary', sumDirs]]) {
    if (result.aggregations.bydirectory.sum_other_doc_count) {
      console.log(`  warning: the ${name} directory list is cut off at 10,000 directories`);
    }
  }
  const match = dayDiffs.length === 0 && dirDiffs.length === 0;
  console.log(`  ${match ? 'MATCH' : 'MISMATCH'}`);
  return match;
}

console.log(`Comparing ${RAW_INDEX} with ${SUMMARY_INDEX} at ${opts.url}${opts.dryRun ? ' (dry run)' : ''}`);
if (opts.year) {
  await compareLastYear();
}
const failed = [];
for (const period of monthPeriods(opts.months)) {
  const match = await compareMonth(period);
  if (!match && !period.current) failed.push(period.label);
}
if (!opts.dryRun) {
  console.log(failed.length ? `\nComplete months that differ: ${failed.join(', ')}` : '\nEvery complete month matches.');
}
process.exit(failed.length ? 1 : 0);
