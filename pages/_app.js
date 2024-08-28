// pages/_app.js
import { SessionProvider } from "next-auth/react"
import DefaultLayout from "../components/layout/default";

import '../styles/globals.css'
import 'mapbox-gl/dist/mapbox-gl.css';

export default function MyApp({ Component, pageProps: {session, ...pageProps} }) {

  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout || DefaultLayout;

  return (
      <SessionProvider session={session}>
        {getLayout(<Component {...pageProps} />)}
      </SessionProvider>
  )
}