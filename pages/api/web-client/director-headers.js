function parseHeader(header_value) {
    try {
        return header_value.split(",").reduce((previous_return, current_segment) => {
            let [key, value] = current_segment.split("=").map(x => x.trim())
            previous_return[key] = value
            return previous_return
        }, {})
    } catch(e) {
        return {}
    }
}


async function getDirectorInformation(url) {
    let res = await fetch(url, {redirect: "manual"})

    let OSDFTokenGeneration = parseHeader(res.headers.get("x-osdf-token-generation"))
    let OSDFNamespace = parseHeader(res.headers.get("x-osdf-namespace"))
    let OSDFAuthorization = parseHeader(res.headers.get("x-osdf-authorizaton"))

    return {
        location: res.headers.get("location"),
        caches: res.headers.get("link").split(", "),
        path: OSDFAuthorization['base-path'],
        issuer: OSDFTokenGeneration['issuer'],
        readHTTPS: OSDFNamespace['readhttps'],
        useTokenOnRead: OSDFNamespace['user-token-on-read'] === "True",
    }
}

export default async function handler(req, res) {
    let requestedUrl = req.query?.url ?? undefined;
    if(requestedUrl !== undefined){
        let issuerInfo = await  getDirectorInformation(requestedUrl)
        res.status(200).json(issuerInfo);
    } else {
        res.status(422).json("This endpoint requires the url parameter to be passed in.");
    }
}