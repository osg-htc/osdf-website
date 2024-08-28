import NextAuth from "next-auth"
import { Issuer, BaseClient } from 'openid-client';

export let provider = {
    name: "Cache Identity Provider",
    type: "oauth",
    id: "dynamic"
}

async function addDynamicProvider(issuerPath){

    const issuer = await Issuer.discover(issuerPath)
    const { Client } = issuer;

    let client = await Client.register({
        "redirect_uris": ["http://localhost:3000/api/auth/callback/dynamic", "https://osdf-chtc-issuer.chtc.chtc.io/scitokens-server/ready"],
        "token_endpoint_auth_method": "client_secret_basic",
        "grant_types": "refresh_token authorization_code",
        "response_types": "code",
        "client_name": "OSG Web Client",
        "scope": "offline_access wlcg storage.read:/ storage.modify:/ storage.create:/"
    })

    let registeredProvider = {
        wellKnown: `${issuerPath}/.well-known/openid-configuration`,
        authorization: client.authorizationUrl({scope: client.scope}),
        clientId: client.client_id,
        clientSecret: client.client_secret,
        ...provider
    }

    return registeredProvider
}

export default async function auth(req, res) {


    if(req.query?.issuer){
        provider = await addDynamicProvider(req.query?.issuer)
    }


    // Do whatever you want here, before the request is passed down to `NextAuth`
    return await NextAuth(req, res, {providers: [provider]})
}