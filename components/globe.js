import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import siteData from '../data/sites.json';

export default function GlobeArea() {
  const globeRef = useRef();
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const colors = [
    'white',
    'silver',
    'red',
    'yellow',
    'lime',
    'green',
    'aqua',
    'teal',
    'blue',
    'fuchsia',
    'purple'
  ]

  const WRAPPER = document.querySelector('#globe');

  useEffect(() => {
    function resize() {

      setWidth(WRAPPER.clientWidth);
      setHeight(WRAPPER.clientHeight < 500 ? 500 : WRAPPER.clientHeight);
    }
    window.addEventListener('resize', resize);
    resize();
    return () => {
      window.removeEventListener('resize', resize);
    }
  }, [])

  // Calculate the arcs
  const arcsData = Array();
  var originCount = 0;
  siteData.origins.forEach(origin => {
    siteData.caches.forEach(cache => {
      arcsData.push({
        startLat: origin.latitude,
        startLng: origin.longitude,
        endLat: cache.latitude,
        endLng: cache.longitude,
        color: colors[originCount % colors.length],
        name: origin.host + ' -> ' + cache.host
      });

    });
    originCount += 1;
  });

  var labelsData = Array();
  labelsData = siteData.origins.map(origin => {
    return {
      lat: origin.latitude,
      lng: origin.longitude,
      text: origin.city
    };
  });
  labelsData.push(...siteData.caches.map(cache => {
    return {
      lat: cache.latitude,
      lng: cache.longitude,
      text: cache.city
    };
  }));




  useEffect(() => {
    const globe = globeRef.current;
    globe.controls().autoRotate = false;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().object.zoom = 1.0;
    globe.pointOfView({ lat: 40, lng: -97, altitude: 2.5 });

    // Check for mobile device, and turn off the globe controls
    let isMobile = window.matchMedia("only screen and (max-width: 760px)").matches;
    if (isMobile) {
      //Conditional script here
      globe.controls().enabled = false;
    }

    function resizeEvent() {
      setWidth(WRAPPER.clientWidth);
      setHeight(WRAPPER.clientHeight);
    }
    window.addEventListener('resize', resizeEvent);

    return () => {
      window.removeEventListener('resize', resizeEvent);
    }
  }, []);

  function arcHover(arc, prevArc) {
    const globe = globeRef.current;
    if (arc != null) {
      globe.controls().autoRotate = false;
    } else {
      globe.controls().autoRotate = true;
    }
  }

  return (
    <>
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
        arcsData={arcsData}
        arcColor={'color'}
        backgroundColor={'#FFFFFF'}
        arcDashLength={() => Math.random()}
        arcDashGap={() => Math.random()}
        arcDashAnimateTime={() => Math.random() * 4000 + 500}
        onArcHover={arcHover}
        width={width}
        height={height}
        labelsData={labelsData}
        labelSize={1}




      />
    </>
  )
}