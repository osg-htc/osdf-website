

export default function FeatureIcon({ icon, title, children }) {

  return (
    <>
      <div className='rounded-lg shadow-lg bg-gray-800 px-5 py-3 mx-6 flex-1 my-6 md:my-0 text-white'>
        <div className='flex flex-row'>
          {icon}
          <h3 className='text-lg font-semibold my-1'>{title}</h3>
        </div>
        {children}
      </div>
    </>
  )


}