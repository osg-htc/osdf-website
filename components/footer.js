

export default function Footer() {
  return (
    <>
      <footer className='flex bg-black items-center justify-between flex-wrap p-6'>
        <div className="container mx-auto">
        This project is supported by National Science Foundation under Cooperative Agreement <a href="https://www.nsf.gov/awardsearch/showAward?AWD_ID=2030508">OAC-2030508</a>. Any opinions, findings, conclusions or recommendations expressed in this material are those of the authors and do not necessarily reflect the views of the National Science Foundation.
        </div>
        <div className='container mx-auto grid grid-cols-4 gap-4'>

        </div>
      </footer>
      <style jsx>{`
      footer {
        box-shadow: 0 50vh 0 50vh #000000;
        color: #fff;
      }
      `}</style>
    </>
  )
}

