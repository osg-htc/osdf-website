import { useState, useEffect } from 'react';
import useSWR from 'swr'
import { ArrowUpIcon } from '@heroicons/react/solid';
import { CloudDownloadIcon, FolderDownloadIcon } from '@heroicons/react/outline';

function fetcher(url) {
  return fetch(url).then(r => r.json())
}

/**
 * Format bytes as human-readable text.
 * 
 * @param bytes Number of bytes.
 * @param si True to use metric (SI) units, aka powers of 1000. False to use 
 *           binary (IEC), aka powers of 1024.
 * @param dp Number of decimal places to display.
 * 
 * @return Formatted string.
 */
function humanFileSize(bytes, si = true, dp = 1) {
  const thresh = si ? 1000 : 1024;

  if (Math.abs(bytes) < thresh) {
    return bytes + ' B';
  }

  /*
  const units = si
    ? ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
  */
  // We only want up to GB's, to show growth!
  const units = si
    ? ['kB', 'MB', 'GB', 'TB']
    : ['KiB', 'MiB', 'GiB', 'TiB'];
  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
    ++u;
  } while (Math.round(Math.abs(bytes) * r) / r >= thresh && u < units.length - 1);
  return numberWithCommas(parseFloat(bytes.toFixed(dp))) + ' ' + units[u];
}

function numberWithCommas(x) {
  if (typeof x === 'number') {
    return x.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x;
  }
}



export default function Stats({inputData}) {

  const { data, error } = useSWR('/api/gatherStats', fetcher)
  var read = 0;
  var filesRead = 0;
  var filesPerSecond = 0;
  var bytesPerSecond = 0;
  if (data) {
    console.log(data);
    read = data.read;
    filesRead = data.filesRead;
    bytesPerSecond = data.bytesPerSecond;
    filesPerSecond = data.filesPerSecond;
  } else {
    read = inputData.read;
    filesRead = inputData.filesRead;
    bytesPerSecond = inputData.bytesPerSecond;
    filesPerSecond = inputData.filesPerSecond;
  }

  return (
    <>
      <section className='bg-gray-900 md:pr-6 pt-6'>
        <div className='container grid md:grid-cols-2 gap-4'>
          <StatCard title='Bytes Read' value={read} rate={bytesPerSecond} humanFunction={humanFileSize} subtext={"Last 1 Year"} icon={<CloudDownloadIcon className='h-10 w10' />} />
          <StatCard title='Objects Read' value={filesRead} rate={filesPerSecond} humanFunction={numberWithCommas} subtext={"Last 1 Year"} icon={<FolderDownloadIcon className="h-10 w-10" />} />
        </div>
      </section>
    </>
  )
}

function StatCard({ title, value, unit, rate, humanFunction, subtext, icon, loading, lastUpdate }) {

  const [showRate, setShowRate] = useState(0);
  const [timer, setTimer] = useState(0);
  const [localValue, setLocalValue] = useState(0);
  const [localAdd, setLocalAdd] = useState(0);
  var loading = false;
  if (value === undefined || value === null || value === 0) {
    loading = true;
  }
  if (localValue != value) {
    setLocalValue(value);
    setLocalAdd(0);
  }
  if (rate != null && rate != 0 && showRate.toFixed(4) != rate.toFixed(4)) {
    setShowRate(rate);
    // Updating the rate, delete the old interval
    if (timer != 0) {
      clearInterval(timer);
    }

    setTimer(setInterval(() => {
      setLocalAdd((prevState) => {
        return prevState + Math.round(rate);
      });
    }
      , 1000));

  }
  useEffect(() => {
    return () => {
      clearInterval(timer);
    }
  }, []);
  return (
    <>
      <div className="p-4 bg-gray-800 rounded shadow-2xl flex flex-col text-white transition ease-in-out delay-75 hover:scale-105 hover:bg-gray-700">
        <div className="flex flex-row w-full">
          <div className="flex flex-col justify-center">
            <h4 className="text-lg text-gray-300 uppercase">{title}</h4>
            <h3 className='text-2xl font-bold'>{localValue ? (
              humanFunction(value + localAdd)
            ) : (
              <svg role="status" className="mr-2 w-8 h-8 text-gray-900 animate-spin fill-white" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
              </svg>
            )} {unit ? unit : ""}</h3>
          </div>
          <div className="ml-auto self-center rounded-full bg-green-500 p-2">{icon}</div>
        </div>
        <div className="flex flex-row items-end">
          <div className="mt-2">
            <span className="flex-row flex items-end">
              <ArrowUpIcon className="h-5 w-5 text-green-400" />

              {humanFunction(rate)}/s

              {subtext ? <p className='text-sm text-gray-500 ml-2'>{subtext}</p> : ""}
            </span>
          </div>
        </div>
      </div>
    </>
  )

}
