import { useEffect, useRef, useState } from 'react';
import Globe from 'react-globe.gl';
import siteData from '../data/sites.json';

export default function GlobeArea() {
  const globeRef = useRef();
  const WRAPPER = document.querySelector('#globe');
  const [width, setWidth] = useState(WRAPPER.clientWidth);
  const [height, setHeight] = useState(WRAPPER.clientHeight < 500 ? 500 : WRAPPER.clientHeight);
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
    globe.controls().autoRotate = true;
    globe.controls().autoRotateSpeed = 0.5;
    globe.controls().object.zoom = 1.2;
    //globe.controls().enabled = false;
    globe.pointOfView({ lat: 40, lng: -50, altitude: 2.5 });


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
        backgroundColor={'#111827'}
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