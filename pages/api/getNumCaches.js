const https = require('https');


export default async function handler(req, res) {
    console.log("Starting request to gracc.opensciencegrid.org");
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    let namespaces;
    const options = new URL('https://topology.opensciencegrid.org/stashcache/namespaces');
    const request = https.request(options, (response) => {
        console.log(`statusCode: ${response.statusCode}`)
        let data = '';
        response.on('data', (d) => {
            data += d;
        })
        response.on('end', () => {
            namespaces = JSON.parse(data);
            console.log(namespaces);
            res.status(200).json({'numCaches': namespaces.caches.length});
        });
    })
    request.on('error', (error) => {
        console.error(error)
        res.status(500).json({'error': error});
    })
    request.end()



}
