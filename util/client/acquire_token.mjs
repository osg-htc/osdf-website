import { Issuer } from 'openid-client';

function parseHeader(header_value) {
    return header_value.split(",").reduce((previous_return, current_segment) => {
        let [key, value] = current_segment.split("=").map(x => x.trim())
        previous_return[key] = value
        return previous_return
    }, {})
}

async function getNamespace(url) {
    let res = await fetch(url, {redirect: "manual"})

    let OSDFTokenGeneration = parseHeader(res.headers.get("x-osdf-token-generation"))
    let OSDFNamespace = parseHeader(res.headers.get("x-osdf-namespace"))
    let OSDFAuthorization = parseHeader(res.headers.get("x-osdf-authorizaton"))

    return {
        caches: res.headers.get("link").split(", "),
        path: OSDFAuthorization['base-path'],
        issuer: OSDFTokenGeneration['issuer'],
        readHTTPS: OSDFNamespace['readhttps'],
        useTokenOnRead: OSDFNamespace['user-token-on-read'] === "True",
    }
}

async function registerClient(registrationEndpoint){

    let clientConfig = {
        "redirect_uris": ["https://localhost/osdf-client"],
        "token_endpoint_auth_method": "client_secret_basic",
        "grant_types": "refresh_token urn:ietf:params:oauth:grant-type:device_code",
        "response_types": "code",
        "client_name": "OSDF Command Line Client",
        "scope": "offline_access wlcg storage.read:/ storage.modify:/ storage.create:/"
    }

    let res = await fetch(registrationEndpoint, {
        method:"POST",
        body: JSON.stringify(clientConfig),
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    })

    if( !res.ok ){
        console.error(await res.text())
    }

    return await res.json()
}

async function acquire_token(url, write){
    const namespace = await getNamespace(url)

    const issuer = await Issuer.discover(namespace.issuer)
    let client = await issuer.Client.register({
        "redirect_uris": ["https://localhost/osdf-client"],
        "token_endpoint_auth_method": "client_secret_basic",
        "grant_types": "refresh_token urn:ietf:params:oauth:grant-type:device_code",
        "response_types": "code",
        "client_name": "OSDF Command Line Client",
        "scope": "offline_access wlcg storage.read:/ storage.modify:/ storage.create:/"
    })

    client = await registerClient(metadata['registration_endpoint'])

    console.log(client)
}

acquire_token("https://director.osgdev.chtc.io/ospool/PROTECTED/justin.hiemstra/auth-test.txt")