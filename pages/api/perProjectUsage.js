const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'https://gracc.opensciencegrid.org' })

export default async function handler(req, res) {
  console.log("Starting request to gracc.opensciencegrid.org");
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  console.log(req.query.start);
  console.log(req.query.end);
  var result = null;
  try {
    result = await client.transport.request({
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
                    "gte": req.query.start * 1000,
                    "lt": req.query.end * 1000
                  }
                }
              }
            ]
          }
        },
        "aggs": {
          "bydirectory": {
            "terms": {
              "field": "logical_dirname.keyword",
              "size": 10000
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
  //console.log(result.aggregations.bydirectory.buckets);
  let data = {};

  result.aggregations.bydirectory.buckets.forEach(function (bucket) {
    // Hueristics to add similar projects together
    let project = bucket.key;
    if (project.startsWith("/gwdata")) {
      project = "/gwdata";
    } else if (project.startsWith("/hcc")) {
      project = "/hcc";
    }
    if (data[project] == undefined) {
      data[project] = 0;
    }
    data[project] += bucket.read.value;
  });

  //console.log(data);

  res.status(200).json(data);
}