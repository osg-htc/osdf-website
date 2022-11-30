const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'https://gracc.opensciencegrid.org' })
var geoip = require('geoip-lite');
const dns = require('dns');


async function lookupPromise(host) {
  return new Promise((resolve, reject) => {
      dns.lookup(host, (err, address, family) => {
          if(err) reject(err);
          resolve(address);
      });
 });
};

export default async function handler(req, res) {
  console.log("Starting request to gracc.opensciencegrid.org");
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  console.log(req.query.cache);

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
                    "gte": "now-1M",
                    "lt": "now"
                  }
                }
              },
              {
                "match": {
                  "server_hostname.keyword": req.query.cache
                }
              }
            ]
          }
        },
        "aggs": {
          "by_client": {
            "terms": {
              "field": "host.keyword"
            },
            "aggs": {
              "sum_read": {
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

  console.log(result);
  let data = new Array();
  for (let i = 0; i < result.aggregations.by_client.buckets.length; i++) {
    let bucket = result.aggregations.by_client.buckets[i];
    let client = bucket.key;
    // Remove [ and ] from ipv6 addresses
    client = client.replace("[", "");
    client = client.replace("]", "");
    
    // If the geiop lookup fails, remove a subdomain and try again
    try {
      var address = await lookupPromise(client)
    } catch (err) {
      console.log(err);
      //continue;
    }
    let geo = geoip.lookup(address);
    console.log(geo);
    while ((geo == null || geo.region == "") && client.split(".").length > 2) {
      console.log("Trying again with " + client);
      let index = client.indexOf(".");
      if (index == -1) {
        break;
      }
      client = client.substring(index + 1);
      console.log("Looking up " + client);
      try {
        var address = await lookupPromise(client)
      } catch (err) {
        console.log(err);
        continue;
      }
      geo = geoip.lookup(address);
      console.log(geo);
    }

    data.push({name: bucket.key, value: bucket.sum_read.value, geo: geo});
  }
  res.status(200).json(data);

}