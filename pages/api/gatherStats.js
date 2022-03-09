const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'https://gracc.opensciencegrid.org' })


export default async function handler(req, res) {
  console.log("Starting request to gracc.opensciencegrid.org");
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
                  "gte": "now-30d",
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
                  "gte": "now-30d",
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
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  const bytesPerSecond = totalRead / (30 * 24 * 60 * 60);
  const filesPerSecond = resultCount.count / (30 * 24 * 60 * 60);
  res.status(200).json({ read: totalRead, bytesPerSecond: bytesPerSecond, filesRead: resultCount.count, filesPerSecond: filesPerSecond, updatetime: Date.now() });
}