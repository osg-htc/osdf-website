// OSDF web client helper functions

import { useSession, signIn, signOut } from "next-auth/react"

async function downloadFile(url, ...props){
    let response = await fetch(url)

    if(response.status === 403){
        return [false, response]
    }

    let blob = await response.blob()
    let blobUrl = window.URL.createObjectURL(blob);
    let a = document.createElement("a")
    a.setAttribute('href', blobUrl)
    a.setAttribute("download", "file.txt")
    a.click()

    return [true, response]
}


async function getDirectorInformation(url)git remote  {
    let res = await fetch(url)
    console.log([...res.headers.entries()])

    let OSDFTokenGeneration = parseHeader(res.headers.get("x-osdf-token-generation"))
    let OSDFNamespace = parseHeader(res.headers.get("x-osdf-namespace"))
    let OSDFAuthorization = parseHeader(res.headers.get("x-osdf-authorization"))

    return {
        caches: res.headers.get("link").split(", "),
        path: OSDFAuthorization['base-path'],
        issuer: OSDFTokenGeneration['issuer'],
        readHTTPS: OSDFNamespace['readhttps'],
        useTokenOnRead: OSDFNamespace['user-token-on-read'] === "True",
    }
}

async function getAccessToken(directorInformation){
    console.log(`${directorInformation['issuer']}/.well-known/openid-configuration`)

    console.log(issuer)

}

export async function getFile(path){
    let directedUrl = (process.env.NEXT_PUBLIC_DIRECTOR_URL) + path

    let directorResponse = await fetch(`/api/web-client/director-headers?url=${encodeURIComponent(directedUrl)}`)
    let directorInformation = await directorResponse.json()

    let [success, response] = await downloadFile(directorInformation['location'])
    if(!success && response.status === 403){
        // TODO: Switch this out with the line below await signIn("dynamic", null, {issuer: directorInformation.issuer})
        await signIn("dynamic", null, {issuer: "https://osdf-chtc-issuer.chtc.chtc.io/scitokens-server/"})
    }


}