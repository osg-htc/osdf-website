const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'https://gracc.opensciencegrid.org' })
const async = require('async');


async function getDataRead(callback) {
  const result = await client.transport.request({
    method: 'POST',
    path: '/q/xrd-stash*/_search',
    body: {
      "query": {
        "bool": {
          "must_not": [
            {
              "terms": {
                "logical_dirname.keyword": ["unknown directory", "missing directory"]
              }
            }
          ],
          "must": [
            {
              "range": {
                "@timestamp": {
                  "gte": "now-1y",
                  "lt": "now"
                }
              }
            }
          ]
        }
      },
      "aggs": {
        "read": {
          "sum": {
            "field": "read"
          }
        }
      }
    }
  });
  console.log(result)
  const totalRead = result.aggregations.read.value;
  callback(null, totalRead);
}

async function getFilesRead(callback) {
  const resultCount = await client.transport.request({
    method: 'POST',
    path: '/q/xrd-stash*/_count',
    body: {
      "query": {
        "bool": {
          "must": [
            {
              "range": {
                "@timestamp": {
                  "gte": "now-1y",
                  "lt": "now"
                }
              }
            }
          ],
          "must_not": [
            {
              "terms": {
                "logical_dirname.keyword": ["unknown directory", "missing directory"]
              }
            }
          ]
        }
      }
    }
  });
  callback(null, resultCount.count);
}

export default async function handler(req, res) {
  console.log("Starting request to gracc.opensciencegrid.org");
  async.parallel({
    totalRead: function (callback) {
      getDataRead(callback);
    },
    totalFiles: function (callback) {
      getFilesRead(callback);
    }
  }, function (err, results) {
    console.log(results);
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    const bytesPerSecond = results.totalRead / (24 * 60 * 60 * 365);
    const filesPerSecond = results.totalFiles / (24 * 60 * 60 * 365);
    res.status(200).json({ read: results.totalRead, bytesPerSecond: bytesPerSecond, filesRead: results.totalFiles, filesPerSecond: filesPerSecond, updatetime: Date.now() });
  });



}