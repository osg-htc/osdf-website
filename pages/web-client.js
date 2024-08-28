import { useSession, signIn, signOut } from "next-auth/react"
import {useState, useRef, useEffect} from "react";
import { css } from '@emotion/react'
import Head from "next/head";

import DefaultLayout from "../components/layout/default";
import { getFile } from "../util/client/util.mjs";



function SearchInput({style, label, ...props}){

    let [input, setInput] = useState("/chtc/staging/clock/auth-test.txt")

    const { data: session } = useSession()

    let inputRef = useRef()
    useEffect(() => {
        inputRef.current.focus()
        inputRef.current.select()
    }, [])

    let onSubmit = (e) => {
        e.preventDefault();
        getFile(input);
    }

    return (
        <form style={style} onSubmit={onSubmit}>
            <label>{label}</label>
            <input
                ref={inputRef}
                style={{ border: "1px solid black", padding: "5px 15px", borderRadius: "20px", fontSize: "24px"}}
                type="text"
                placeholder="/<namespace>/<file-path>"
                value={input}
                onChange={(e) => setInput(e.target.value)}
            />
            <small style={{color: "blue"}}>Protected files will trigger login</small>
            <button style={{visibility: "hidden"}}/>
        </form>
    )
}

export default function WebClient({...props}) {
    return (
        <>
            <Head>
                <title>Web Client</title>
            </Head>
            <div className={"m-auto mt-5"} style={{width: "50%", minHeight: "80vh;"}}>
                <h1 className={"text-3xl font-bold pb-4"}>OSDF Web Client</h1>
                <SearchInput label={"Download File"} style={{display: "flex", flexDirection: "column"}}/>
            </div>
        </>

    )
}
