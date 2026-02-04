//const { Client } = require('@elastic/elasticsearch')
const { Client } = require("@opensearch-project/opensearch");
const client = new Client({ node: 'https://gracc.opensciencegrid.org', requestTimeout: 300000 })

export default async function handler(req, res) {
  console.log("Starting request to gracc.opensciencegrid.org");
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  console.log(req.query.start);
  console.log(req.query.end);

  var result = null;
  try {
    result = await client.transport.request({
      method: 'POST',
      path: '/q/xrd-stash/_search',
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
                    "gte": req.query.start * 1000,
                    "lt": req.query.end * 1000
                  }
                }
              }
            ]
          }
        },
        "aggs": {
          "bytime": {
              "date_histogram": {
                  "field": "@timestamp",
                  "interval": "day"
              },
              "aggs": {
                  "read": {
                      "sum": {
                          "field": "read"
                      }
                  }
              }
          }
      }
      }
    });
  } catch (err) {
    console.log(err);
    return
  }
  //console.log(result)
  //console.log(result.aggregations.bytime.buckets);
  let data = new Array();
  result.body.aggregations.bytime.buckets.forEach(function(bucket) {
    data.push([bucket.key, bucket.read.value]);
    //console.log(bucket.key);
    //console.log(bucket.read.value);
  });

  //console.log(data);

  res.status(200).json(data);
}