import Head from 'next/head'
import NavBar from '../components/navbar'
import StatsCard from '../components/statsCard'
import BriefcaseIcon from '@heroicons/react/outline/BriefcaseIcon'
import useSWR from 'swr'
import CacheUsageGraph from '../components/cacheUsageGraph'
import { useState, useMemo, useEffect, useRef } from 'react'
import { useQueryState } from '../components/useQueryState';


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
    ? ['kB', 'MB', 'GB', 'TB', 'PB']
    : ['KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
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
    return x.toFixed(1).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  } else {
    return x;
  }
}


// Create month time periods for a drop down selector
function createPeriods() {
  var periods = [];
  var today = new Date();
  var currentMonth = today.getUTCMonth();
  var currentYear = today.getFullYear();
  for (var i = 0; i < 12; i++) {
    var month = currentMonth - i;
    var year = currentYear;
    if (month == 0) {
      month = 12;
      year = currentYear - 1;
    }
    // Convert month and year to unix epoch
    var date = new Date(Date.UTC(year, month, 1));
    console.log("Start date:" + date.toLocaleString('default', { timeZone: 'UTC' }));
    // convert date to unix epoch
    var startMonth = date.getUTCMonth();
    var englishMonth = date.toLocaleString('default', { month: 'short', timeZone: 'UTC' });
    var startEpoch = date.getTime() / 1000;
    // Add 1 month
    date.setUTCMonth((date.getUTCMonth() + 1) % 12, 0)
    date.setUTCHours(23, 59, 59);

    // convert date to unix epoch
    var endEpoch = date.getTime() / 1000;
    console.log("End date:" +  date.toLocaleString('default', { timeZone: 'UTC' }));

    var period = { month: month, year: year, label: englishMonth + " " + year, value: [startEpoch, endEpoch] };
    periods.push(period);
  }
  return periods;
}


export default function Reports() {
  const periods = useMemo(() => createPeriods(), []);
  //const [period, setPeriod] = useState(periods[0].value.toString());
  const [periodState, setPeriod] = useQueryState("period", periods[0].value.toString());

  // Calculate the number of caches:
  const numCachesData = useSWR('/api/getNumCaches', fetcher)
  let numCaches = 0;
  if (numCachesData.data) {
    numCaches = numCachesData.data.caches.length;
  } if (!numCachesData.data && !numCachesData.error) {
    numCaches = "Loading...";
  } else if (numCachesData.error) {
    numCaches = "Error";
  }

  //console.log(periodState);
  const [start, end] = periodState.split(",").map(x => parseInt(x));
  const cacheUsage = useSWR('/api/cacheUsage?start=' + start + '&end=' + end, fetcher);
  
  // Add up all the days
  let totalUsage = 0;
  if (cacheUsage.data) {
    for (var i = 0; i < cacheUsage.data.length; i++) {
      totalUsage += cacheUsage.data[i][1];
    }
    totalUsage = humanFileSize(totalUsage);
  } else if (!cacheUsage.data && !cacheUsage.error) {
    totalUsage = "Loading...";
  } else if (cacheUsage.error) {
    totalUsage = "Error";
  }

  const perProjectUsage = useSWR('/api/perProjectUsage?start=' + start + '&end=' + end, fetcher);
  let totalProjects = 0;
  if (perProjectUsage.data) {
    totalProjects = Object.keys(perProjectUsage.data.directories).length;
  } else if (!perProjectUsage.data && !perProjectUsage.error) {
    totalProjects = "Loading...";
  } else if (perProjectUsage.error) {
    totalProjects = "Error";
  }


  function changePeriod(event) {
    let period = event.target.value;
    console.log(period);
    setPeriod(period);
  }

  
  const date = new Date(start * 1000);
  const month = date.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
  const year = date.getFullYear();

  function pdfSave() {
    console.log("Save PDF");
    const html2pdf = import('html2pdf.js').then(html2pdf => {
      console.log("Inside import of html2pdf");
      const element = document.getElementById('report-frame');
      const opt = {
        margin: 0.1,
        filename: 'report.pdf',
        image: { type: 'png', quality: 1.0 },
        html2canvas: { dpi: 75, scale: 2, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait', compressPDF: true}
      };
      html2pdf.default().from(element).set(opt).toPdf().get('pdf').then((pdf) => {
        console.log("Adding footer to PDF")
        var totalPages = pdf.internal.getNumberOfPages();

        console.log("getHeight:" + pdf.internal.pageSize.getHeight());
        console.log("getWidth:" + pdf.internal.pageSize.getWidth());
        for (let i = 1; i <= totalPages; i++) {
          // set footer to every page
          pdf.setPage(i);
          // set footer font
          pdf.setFontSize(10);
          pdf.setTextColor(0);
          // this example gets internal pageSize just as an example to locate your text near the borders in case you want to do something like "Page 3 out of 4"
          pdf.text(0.1,
            pdf.internal.pageSize.getHeight()-0.1, 'Generated from ' + window.location.href);
        }
      }).save();
    });
  }

  return (
    <>
      <Head>
        <title>OSDF Reports</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className='container mx-auto' id="report-frame">
        <div className='grid mt-4 justify-center'>
          <h1 className='text-4xl font-bold'>OSDF Reports: {month} {year}</h1>
        </div>
        <div className='grid mt-4 justify-center gap-4'>
          <select className='border border-gray-300 rounded-md shadow-sm py-2 px-3 text-sm font-medium text-gray-900 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500'
            onChange={changePeriod}
            value={periodState}
            data-html2canvas-ignore="true">
            {periods.map((period) => (
              <option key={period.label} value={period.value}>{period.label}</option>
            ))}
          </select>
          <button className='inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
            data-html2canvas-ignore="true">
            <a onClick={pdfSave} target="_blank">Save Report as PDF</a>
          </button>
        </div>
        <div className='grid grid-cols-3 mt-8 justify-center divide-x-2 lg:max-w-5xl mx-auto'>
          <StatsCard icon={<BriefcaseIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />} title='Projects' value={totalProjects} />
          <StatsCard icon={<BriefcaseIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />} title='Caches' value={numCaches}>
          </StatsCard>
          <StatsCard icon={<BriefcaseIcon className='h-7 w-7 text-lime-400 mr-1 my-1' />} title='Transferred' value={totalUsage} />
        </div>
        <div className='flex justify-items-center place-content-center mt-8'>
          <CacheUsageGraph timeperiod={periodState} />
        </div>
      </div>
    </>
  )
}
