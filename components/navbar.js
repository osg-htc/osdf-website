import Image from "next/image"
import NavLink from "./navlink";

export default function NavBar() {

  function expandMobileMenu() {
    document.getElementById("mobile-menu").classList.toggle("hidden");
  }

  return (
    <>
      <nav className=" px-2 sm:px-4 py-5 bg-gray-900">
        <div className="container flex flex-wrap justify-between items-center mx-auto">
          <a href="/" className="flex items-center">
            <Image src={"/OSG-logo.svg"} alt="logo" width="60" height="30" />
            <span className="self-center text-xl font-semibold whitespace-nowrap text-white ml-2">OSDF</span>
          </a>
          <button onClick={expandMobileMenu} data-collapse-toggle="mobile-menu" type="button" className="inline-flex items-center p-2 ml-3 text-sm text-gray-500 rounded-lg md:hidden focus:outline-none" aria-controls="mobile-menu-2" aria-expanded="false">
            <span className="sr-only">Open main menu</span>
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clip-rule="evenodd"></path></svg>
          </button>
          <div className="hidden w-full md:block md:w-auto" id="mobile-menu">
            <ul className="flex flex-col mt-4 md:flex-row md:space-x-8 md:mt-0 md:text-sm md:font-medium">
              <li>
                <NavLink href="/client" exact={true} className="block mt-4 lg:inline-block lg:mt-0 text-white link-underline mr-4 active:font-bold">
                  Client
                </NavLink>
              </li>
              <li>
                <NavLink href="/reports" exact={true} className="block mt-4 lg:inline-block lg:mt-0 text-white link-underline mr-4 active:font-bold">
                  Reports
                </NavLink>
              </li>
              <li>
                <a href="https://opensciencegrid.org/docs/data/stashcache/overview/" className="block mt-4 lg:inline-block lg:mt-0 text-white link-underline mr-4">
                  Docs
                </a>
              </li>
              <li>
                <a href="https://portal.osg-htc.org/documentation/htc_workloads/managing_data/osdf/" className="block mt-4 lg:inline-block lg:mt-0 text-white link-underline mr-4">
                  Examples
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
      <style jsx>{`
      .link-underline {
        border-bottom-width: 0;
        background-image: linear-gradient(transparent, transparent), linear-gradient(#fff, #fff);
        background-size: 0 3px;
        background-position: 0 100%;
        background-repeat: no-repeat;
        transition: background-size .5s ease-in-out;
      }
    
      .link-underline-black {
        background-image: linear-gradient(transparent, transparent), linear-gradient(#F2C, #F2C)
      }
    
      .link-underline:hover {
        background-size: 100% 3px;
        background-position: 0 100%
      }
      `}</style>

    </>
  )
}

