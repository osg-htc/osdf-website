import Head from "next/head";
import NavBar from "../navbar";
import Footer from "../footer";
import { css } from '@emotion/react'

export default function DefaultLayout( page ){
    return (
        <>
            <Head>
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <NavBar />
            <main>
                { page }
            </main>
            <Footer />
        </>
    )
}
