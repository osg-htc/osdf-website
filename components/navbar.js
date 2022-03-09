import Image from "next/image"

export default function NavBar() {
  return (
    <nav className="flex items-center justify-between flex-wrap bg-gray-900 p-6">
      <div className="container mx-auto flex items-center flex-no-shrink text-white mr-6">
        <div className="flex items-center flex-shrink-0 text-white mr-6">
          <Image src={"/OSG-logo.svg"} alt="logo" width="60" height="30" />
          <span className="font-semibold text-xl tracking-tight ml-2">OSDF</span>
        </div>
        <div className="block lg:hidden">
          <button className="flex items-center px-3 py-2 border rounded text-teal-200 border-teal-400 hover:text-white hover:border-white">
            <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><title>Menu</title><path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" /></svg>
          </button>
        </div>
        <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
          <div className="text-sm lg:flex-grow">
            <a href="https://opensciencegrid.org/docs/data/stashcache/overview/" className="block mt-4 lg:inline-block lg:mt-0 hover:text-white mr-4">
              Docs
            </a>
            <a href="https://support.opensciencegrid.org/support/solutions/articles/12000002775-transfer-large-input-and-output-files" className="block mt-4 lg:inline-block lg:mt-0 hover:text-white mr-4">
              Examples
            </a>
            <a href="#responsive-header" className="block mt-4 lg:inline-block lg:mt-0 hover:text-white">
              Blog
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}

