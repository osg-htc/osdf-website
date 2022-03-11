import Head from 'next/head'
import Link from 'next/link'
import NavBar from '../components/navbar'
import Footer from '../components/footer'
import { ServerIcon, CodeIcon, GlobeIcon, CogIcon } from '@heroicons/react/outline'

import dynamic from 'next/dynamic'
import Stats from '../components/stats'

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
        <div className='container mx-auto lg:grid lg:grid-cols-2 lg:gap-4'>
          <div className='hero-text'>
            <div>
              <h1 className='md:text-6xl text-2xl font-extrabold mb-4 text-white'>Open Science Data Federation</h1>
              <p className='mt-5 sm:mt-10 lg:w-10/12 text-gray-400 font-normal text-lg sm:text-lg">'>
                Providing data access and transfer services for Open Science
              </p>
              <Stats />
            </div>
          </div>
          <div id="globe">
            <GlobeArea />
          </div>
        </div>

      </div>

      <div className='w-full bg-gray-900 p-8 text-white'>

        <div className='container flex-none md:flex md:flex-row justify-center items-stretch mx-auto'>
          <div className='rounded shadow-lg bg-gray-800 p-6 mx-6 flex-1 my-6 md:my-0'>
            <div className='flex flex-row'>
              <CodeIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />
              <h3 className='text-lg font-semibold my-1'>Built on Open Source</h3>
            </div>
            <p>Built projects such as <a href="https://xrootd.slac.stanford.edu/" className='text-blue-300 hover:text-blue-500'>XRootD</a>,
              {' '}<a href="https://xrootd.slac.stanford.edu/" className='text-blue-300 hover:text-blue-500'>CVMFS</a>,
              and <a href="https://xrootd.slac.stanford.edu/" className='text-blue-300 hover:text-blue-500'>Kubernetes</a></p>
          </div>
          <div className='rounded shadow-lg bg-gray-800 p-6 mx-6 flex-1 my-6 md:my-0'>
            <div className='flex flex-row'>
              <CogIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />
              <h3 className='text-lg font-semibold my-1'>Client Tools availble on the OSG</h3>
            </div>
            <p>Client tools such as <Link href="/stashcp"><a className='text-blue-300 hover:text-blue-500'>StashCP</a></Link> and CVMFS available for every operating system.</p>
          </div>
          <div className='rounded shadow-lg bg-gray-800 p-6 mx-6 flex-1 my-6 md:my-0'>
            <div className='flex flex-row'>
              <GlobeIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />
              <h3 className='text-lg font-semibold my-1'>
                Globally Distributed Caches</h3>
            </div>
            <p>Caches located throughout the globe at participating organizations and on the network backbone.</p>
          </div>
        </div>


      </div>

      <Footer />

    </>
  )
}
