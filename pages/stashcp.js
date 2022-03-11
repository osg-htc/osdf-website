import Head from 'next/head'
import NavBar from '../components/navbar'
import Footer from '../components/footer'
import TypedArea from '../components/typed'
import { DownloadIcon, CodeIcon } from '@heroicons/react/solid'


export default function StashCP() {
  return (
    <>
      <Head>
        <title>StashCP</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className='w-full flex bg-gray-900 p-6 flex-row items-center'>
        <div className='container mx-auto lg:grid lg:grid-cols-2 lg:gap-4'>
          <div className='py-12'>
            <div>
              <h1 className='md:text-6xl text-2xl font-extrabold mb-4 text-white'>StashCP</h1>
              <p className='mt-5 sm:mt-10 lg:w-10/12 text-gray-400 font-normal text-lg sm:text-lg">'>
                Client tool to download or upload files on the Open Science Data Federation.
              </p>
              <div className=''>
                <button onClick={() => window.location = "https://github.com/opensciencegrid/stashcp/releases"} className='button bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-2 px-4 rounded-lg mt-5 shadow'>
                  <div className='flex flex-row items-center'>
                    <div className='flex flex-col items-start'>
                      <span>Download StashCP for your platform</span>
                      <span className='text-sm opacity-90 font-normal'>rpm, deb, exe, static binary</span>
                    </div>
                    <div>
                      <DownloadIcon className='h-10 w-10 ml-3' />
                    </div>
                  </div>
                </button>
                <br />
                <button onClick={() => window.location = "https://github.com/opensciencegrid/stashcp"} className='button bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded-lg mt-5 shadow'>
                  <div className='flex flex-row items-center'>
                    <div className='flex flex-col items-start'>
                      <span>View the Source</span>
                    </div>
                    <div>
                      <CodeIcon className='h-8 w-8 ml-3' />
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <div id="typed" className='text-white flex flex-row items-center'>
            <TypedArea />
          </div>
        </div>

      </div>
      <Footer />
    </>
  )
}