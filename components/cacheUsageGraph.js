
import useSWR from 'swr'
import * as d3 from 'd3';
import React, { useState, useEffect, useRef } from 'react';


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


function setupGraph(series, dom_id, title, background, showgraph = true, elementWidth = 960, elementHeight = 500) {

  var margin = { top: 40, right: 20, bottom: 100, left: 50 },
    width = elementWidth - margin.left - margin.right,
    height = elementHeight - margin.top - margin.bottom;

  const y_ticks = 8;
  var parseTime = d3.isoParse//d3.timeParse("%Q");

  var x = d3.scaleBand().rangeRound([0, width], .05).padding(0.1);
  var y = d3.scaleLinear().range([height, 0]);

  var xAxis = d3.axisBottom(x)
    //.scale(x)
    .tickFormat((t, i) => {
      if (i % 4 == 0) {

        return d3.utcFormat("%m-%d")(parseTime(t)); // d3.timeFormat("%b %d")(parseTime(t));
      }
      return "";
    });
  //.tickValues(x.domain().filter(function (d, i) { return !(i % 5) }));


  var yAxis = d3.axisLeft()
    .scale(y)
    .ticks(y_ticks)
    .tickFormat((x) => {
      return humanFileSize(x);
    });

  var svg = d3.select(dom_id).append("svg")
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
      "translate(" + margin.left + "," + margin.top + ")");

  series.forEach(function (d) {
    d.date = parseTime(d[0]);
    d.value = +d[1];
  });

  // gridlines in y axis function
  function make_y_gridlines() {
    return d3.axisLeft(y)
      .ticks(y_ticks)
  }

  x.domain(series.map(function (d) { return d.date; }));
  y.domain([0, d3.max(series, function (d) { return d.value; })]);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis)
    .selectAll("text")
    .style("text-anchor", "center")
    .attr("dx", "0em")
    .attr("dy", ".85em")
    .attr("transform", "rotate(0)");

  // add the Y gridlines
  svg.append("g")
    .attr("class", "grid")
    .call(make_y_gridlines()
      .tickSize(-width)
      .tickFormat("")
    )

  svg.append("text")
    .attr("x", (width / 2))
    .attr("y", 0 - (margin.top / 2))
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text(title);

  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 6)
    .attr("dy", ".71em")
    .style("text-anchor", "end")
    .text("Bytes");

  svg.selectAll("bar")
    .data(series)
    .enter().append("rect")
    .style("fill", "steelblue")
    .attr("x", function (d) { return x(d.date); })
    .attr("width", x.bandwidth())
    .attr("y", function (d) { return y(d.value); })
    .attr("height", function (d) { return height - y(d.value); });

  console.log(series);

}

export default function CacheUsageGraph({ timeperiod }) {

  // Time period is a string in the form of startEpoch,endEpoch
  const [start, end] = timeperiod.split(",").map(x => parseInt(x));
  const { data, error } = useSWR('/api/cacheUsage?start=' + start + '&end=' + end, fetcher)
  const [fadedClass, setFadedClass] = useState('');
  const chart = useRef(null);
  const date = new Date(start * 1000);
  const month = date.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
  const year = date.getFullYear();

  /*
  if (data) {
    chart.current.innerHTML = '';
    setupGraph(data, '#cacheUsageGraph', 'Data transferred in OSDF: ' + month + " " + year, 'white');
    setFadedClass('');
  } else if (!data && !error) {
    setFadedClass('opacity-60');
  }
  */

  useEffect(() => {
    if (data) {
      chart.current.innerHTML = '';
      setupGraph(data, '#cacheUsageGraph', 'Data transferred in OSDF: ' + month + " " + year, 'white');
      setFadedClass('');
    } else if (!data && !error) {
      setFadedClass('opacity-20');
    }
  }, [data, error, timeperiod]);

  return (
    <>
      <div id="cacheUsageGraph" ref={chart} className={`p-10 w-full ${fadedClass}`}></div>
    </>
  )


}
