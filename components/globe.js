import { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import siteData from '../data/sites.json';

export default function GlobeArea() {
  const globeRef = useRef();
  const WRAPPER = document.querySelector('#globe');

  // Calculate the arcs
  const arcsData = Array();
  siteData.origins.forEach(origin => {
    siteData.caches.forEach(cache => {
      arcsData.push({
        startLat: origin.latitude,
        startLng: origin.longitude,
        endLat: cache.latitude,
        endLng: cache.longitude,
        color: [['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)], ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)]],
        name: origin.host + ' -> ' + cache.host
      });

    });
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
    globe.pointOfView({ lat: 40, lng: -50, altitude: 2.5 });


    window.addEventListener('resize', function () {
      globe.width(WRAPPER.clientWidth);
      globe.height(WRAPPER.clientHeight);
    });
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
        width={WRAPPER.clientWidth}
        height={WRAPPER.clientHeight}
        labelsData={labelsData}
        labelSize={1}




      />
    </>
  )
}