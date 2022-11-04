


export default function StatsCard(props) {

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
      <div className='relative flex flex-col flex-none justify-center hover-trigger'>
        <h3 className='text-lg font-semibold my-1 uppercase text-center'>{props.title}</h3>
        <div className="text-2xl font-bold text-center">
          {props.value}
        </div>
        {props.children && (
          <div className='absolute invisible -right-[10em] z-10 opacity-0 transition-opacity ease-in-out duration-300 flex flex-col p-2 hover-target bg-white border border-gray-200'>
            {props.children}
          </div>
        )}

      </div>

      <style jsx>{`
      /*
        .hover-trigger .hover-target {
          visibility: hidden;
        }
        */
        .hover-trigger:hover .hover-target {
          // display: block;
          visibility: inherit;
          opacity: 1;
        }

      `}</style>

    </>
  )


}