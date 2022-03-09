import Head from 'next/head'
import NavBar from '../components/navbar'
import Footer from '../components/footer'

import dynamic from 'next/dynamic'

const GlobeArea = dynamic(() => import('../components/globe.js'), { ssr: false })

export default function Home() {
  return (
    <>
      <NavBar />

      <Head>
        <title>Open Science Data Federation</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className='w-full flex bg-gray-900 p-6'>
        <div className='container mx-auto grid md:grid-cols-2 gap-4'>
          <div className='hero-text'>
            <div>
              <h1 className='md:text-6xl text-2xl font-extrabold mb-4 text-white'>Open Science Data Federation</h1>
              <p className='mt-5 sm:mt-10 lg:w-10/12 text-gray-400 font-normal text-lg sm:text-lg">'>
                Providing data access and transfer services for Open Science
              </p>
            </div>
          </div>
          <div id="globe" className='hidden md:block'>
            <GlobeArea />
          </div>
        </div>

      </div>
      <Footer />
      
    </>
  )
}
