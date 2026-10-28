/**
 * Queries against the OSDF summary indices in GRACC, used by the API routes and by
 * scripts/compare-summary.mjs.
 *
 * The osdf-summary transforms roll the raw xrd-stash records up into one row per UTC day for
 * each directory, cache, site and client domain. Each row holds sums such as read_sum, and
 * transform._doc_count is the number of raw records it stands for.
 */

// The hyphen matters: an older, unrelated index is named plain "osdf-summary".
export const SUMMARY_INDEX = 'osdf-summary-*';
export const SUMMARY_SEARCH_PATH = `/q/${SUMMARY_INDEX}/_search`;

// Rows are whole UTC days, so the last year starts at midnight UTC.
export const LAST_YEAR = { gte: 'now-1y/d', lt: 'now' };

function rangeQuery(gte, lt) {
  return {
    "bool": {
      "must_not": [
        {
          "terms": {
            "logical_dirname": ["unknown directory", "missing directory"]
          }
        }
      ],
      "must": [
        {
          "range": {
            "@timestamp": {
              "gte": gte,
              "lt": lt
            }
          }
        }
      ]
    }
  };
}

// Total bytes read: aggregations.read.value
export function totalReadQuery(gte, lt) {
  return {
    "size": 0,
    "query": rangeQuery(gte, lt),
    "aggs": {
      "read": {
        "sum": {
          "field": "read_sum"
        }
      }
    }
  };
}

// Number of raw records (files read): aggregations.files.value
export function filesReadQuery(gte, lt) {
  return {
    "size": 0,
    "query": rangeQuery(gte, lt),
    "aggs": {
      "files": {
        "sum": {
          "field": "transform._doc_count"
        }
      }
    }
  };
}

// Bytes read per UTC day: aggregations.bytime.buckets[].read.value
export function dailyReadQuery(gte, lt) {
  return {
    "size": 0,
    "query": rangeQuery(gte, lt),
    "aggs": {
      "bytime": {
        "date_histogram": {
          "field": "@timestamp",
          "calendar_interval": "1d"
        },
        "aggs": {
          "read": {
            "sum": {
              "field": "read_sum"
            }
          }
        }
      }
    }
  };
}

// Bytes read per directory: aggregations.bydirectory.buckets[].read.value
export function readByDirectoryQuery(gte, lt) {
  return {
    "size": 0,
    "query": rangeQuery(gte, lt),
    "aggs": {
      "bydirectory": {
        "terms": {
          "field": "logical_dirname",
          "size": 10000
        },
        "aggs": {
          "read": {
            "sum": {
              "field": "read_sum"
            }
          }
        }
      }
    }
  };
}
