const { Client } = require('@elastic/elasticsearch')
const client = new Client({ node: 'https://gracc.opensciencegrid.org' })
const async = require('async');
const AWS = require('aws-sdk');
const https = require('https');

async function getDataRead(callback) {
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
  } catch (err) {
    console.log(err);
    callback(err);
    return
  }
  console.log(result)
  const totalRead = result.aggregations.read.value;
  callback(null, totalRead);
}

async function getFilesRead(callback) {
  var resultCount = null;
  try {
    resultCount = await client.transport.request({
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
  } catch (err) {
    console.log(err);
    callback(err);
    return
  }
  callback(null, resultCount.count);
}

function getS3Config() {
  var s3 = new AWS.S3({
    accessKeyId: process.env.NEXT_PUBLIC_S3ID,
    secretAccessKey: process.env.NEXT_PUBLIC_S3ACESSSKEY,
    endpoint: 'https://s3-west.nrp-nautilus.io',
    signatureVersion: 'v4',
    s3ForcePathStyle: true,
    httpOptions: {
      agent: new https.Agent({ rejectUnauthorized: false })
    }
  });
  return s3;
}

function saveResult(result) {
  var s3 = getS3Config();
  var params = { Bucket: 'dweitzel', Key: 'osdf-website/saved-state', Body: JSON.stringify(result) };
  s3.putObject(params, function (err, data) {
    if (err)
      console.log(err)
    else
      console.log("Successfully uploaded data to dweitzel/osdf-website/saved-state");
  });
}

function getSavedState() {
  var s3 = getS3Config();
  var params = { Bucket: 'dweitzel', Key: 'osdf-website/saved-state' };
  let returnedPromise = new Promise((resolve, reject) => {
    s3.getObject(params, function (err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        reject(err);
      } else {
        console.log(data);           // successful response
        resolve(data.Body);
      }
    });
  });
  return returnedPromise;
}

export async function getData() {
  var toReturn = new Promise((resolve, reject) => {
    // Run the gracc queries in parallel
    async.parallel({
      totalRead: function (callback) {
        getDataRead(callback);
      },
      totalFiles: function (callback) {
        getFilesRead(callback);
      }
    }, function (err, results) {
      if (err) {
        console.log(err);
        reject(err);
      }
      const bytesPerSecond = results.totalRead / (24 * 60 * 60 * 365);
      const filesPerSecond = results.totalFiles / (24 * 60 * 60 * 365);
      const result = {
        read: results.totalRead,
        filesRead: results.totalFiles,
        bytesPerSecond: bytesPerSecond,
        filesPerSecond: filesPerSecond,
        updateTime: Date.now()
      }
      resolve(result);
    });
  });
  return toReturn;
}

export default async function handler(req, res) {
  console.log("Starting request to gracc.opensciencegrid.org");
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  var data;
  try {
    data = await getData();
    saveResult(data);
  } catch (err) {
    console.log(err);
    try {
      data = await getSavedState();
    } catch (err) {
      console.log(err);
      res.status(500).json({err: err});
    }
  }
  res.status(200).json(data);

}