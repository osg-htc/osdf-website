import Head from 'next/head'
import NavBar from '../components/navbar'
import Footer from '../components/footer'
import TypedArea from '../components/typed'
import FeatureIcon from '../components/featureIcon'
import { DownloadIcon, CodeIcon } from '@heroicons/react/solid'
import { BriefcaseIcon, DesktopComputerIcon, ExclamationIcon } from '@heroicons/react/outline'


export default function StashCP() {
  return (
    <>
      <Head>
        <title>OSDF Client</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className='w-full flex bg-gray-900 p-6 flex-row items-center'>
        <div className='container mx-auto lg:grid lg:grid-cols-2 lg:gap-4'>
          <div className='py-12'>
            <div>
              <h1 className='md:text-6xl text-2xl font-extrabold mb-4 text-white'>OSDF Client</h1>
              <p className='mt-5 sm:mt-10 lg:w-10/12 text-gray-400 font-normal text-lg sm:text-lg">'>
                StashCP is the client tool to download or upload files on the Open Science Data Federation.
              </p>
              <div className=''>
                <button onClick={() => window.location = "https://github.com/htcondor/osdf-client/releases"} className='button bg-green-600 hover:bg-green-700 text-white text-lg font-bold py-2 px-4 rounded-lg mt-5 shadow'>
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
                <button onClick={() => window.location = "https://github.com/htcondor/osdf-client"} className='button bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-2 px-4 rounded-lg mt-5 shadow'>
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
          <div id="typed" className='text-white md:flex flex-row items-center hidden'>
            <TypedArea />
          </div>
        </div>

      </div>
      <div className='w-full bg-gray-900'>
        <div className='container flex-none md:flex md:flex-row justify-center items-stretch mx-auto py-5'>
          <FeatureIcon icon={<ExclamationIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />}
            title='Failure is expected!'>
            <p>StashCP expects failure.  It retries connections, attempts to download from multiple caches, and downloads through different methods.</p>

          </FeatureIcon>
          <FeatureIcon icon={<DesktopComputerIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />}
            title='Many supported platforms'>
            <p>StashCP is compiled for many platforms and packaging managers.  It supports Linux, Mac, Windows OS.  It also has packages for Debian, RPMs, and Alpine.</p>
          </FeatureIcon>

          <FeatureIcon icon={<BriefcaseIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />}
            title='Portable'>
            <p>StashCP is statically compiled binary.  The same executable can run on multiple version of Linux.</p>
          </FeatureIcon>

        </div>
      </div>
      <Footer />
    </>
  )
}