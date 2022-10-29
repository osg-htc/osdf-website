


export default function StatsCard({ icon, title, value }) {

  /*
   <div className='bg-slate-600 text-white rounded-lg shadow-lg px-5 py-3 mx-6 flex-initial my-6 md:my-0 lg:w-1/6 md:1/3'>
        <div className='flex flex-row'>
          {icon}
          <h3 className='text-lg font-semibold my-1 uppercase'>{title}</h3>
        </div>
        <div className="text-2xl font-bold">
        {value}
        </div>
      </div>
      */

  return (
    <>
      <div className='flex flex-col flex-none justify-center'>
          <h3 className='text-lg font-semibold my-1 uppercase text-center'>{title}</h3>
          <div className="text-2xl font-bold text-center">
            {value}
        </div>
      </div>
    </>
  )


}