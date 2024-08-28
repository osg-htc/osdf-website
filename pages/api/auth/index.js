
import { Issuer, Client } from 'openid-client';


export default async function handler(req, res) {
    let requestedUrl = req.query?.url ?? undefined;

    let data = JSON.parse(req.body)

    let issuer = await Issuer.discover(data['issuer'])
    const client = await issuer.Client.register({
        "redirect_uris": ["https://localhost/osdf-client"],
        "token_endpoint_auth_method": "client_secret_basic",
        "grant_types": "refresh_token urn:ietf:params:oauth:grant-type:device_code",
        "response_types": "code",
        "client_name": "OSDF Command Line Client",
        "scope": "offline_access wlcg storage.read:/ storage.modify:/ storage.create:/"
    })



    console.log(client)

    if(requestedUrl !== undefined){
        let issuerInfo = await  getDirectorInformation(requestedUrl)
        res.status(200).json(issuerInfo);
    }

    res.status(422).json("This endpoint requires the url parameter to be passed in.");
}