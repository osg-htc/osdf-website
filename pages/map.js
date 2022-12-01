import Head from 'next/head'
import NavBar from '../components/navbar'
import useSWR from 'swr'
import { useState, useMemo, useEffect, useRef } from 'react'
import Map, { Marker, Layer, NavigationControl, Source, Popup } from 'react-map-gl';
import siteData from '../data/sites.json';
import { humanFileSize } from '../util/util.js';
import DataTable from 'react-data-table-component';
import { point, featureCollection } from '@turf/helpers';
import circle from '@turf/circle'

function fetcher(url) {
  return fetch(url).then(r => r.json())
}

// Combine clients by city,region,country
function combineClients(clients) {
  const combined = {};
  for (const client of clients) {
    const key = `${client.geo.city},${client.geo.region},${client.geo.country}`;
    if (key in combined) {
      combined[key].value += client.value;
    } else {
      combined[key] = client;
    }
  }
  return Object.values(combined);
}

const initialViewState = {
  center: [-96.70554062901587, 40.819759045397525],
  longitude: -96.70554062901587,
  latitude: 40.819759045397525,
  zoom: 3.5,
  pitch: 0,
  bearing: 0,
  //projection: 'globe'
};

function ExpandedRow({ data }) {
  return (
    <div className='p-2 flex flex-col text-xs'>
      <div>
        <span className='font-bold'>Domain:</span> {data.name}
      </div>
      <div>
        <span className='font-bold'>Number of Clients:</span> {data.clients}
      </div>
      <div>
        <span className='font-bold'>City:</span> {data.geo.city}
      </div>
      <div>
        <span className='font-bold'>Region:</span> {data.geo.region}
      </div>
      <div>
        <span className='font-bold'>Country:</span> {data.geo.country}
      </div>
    </div>
  );
}

function DataTableLoading() {
  return (
    <>
      <div className='flex justify-center items-center flex-col'>
        <div role="status" className='mt-3 flex flex-row items-center'>
          <div>
            <p className='text-sm font-medium text-gray-900 dark:text-white'>Loading clients...</p>
          </div>
          <div className='ml-2'>
            <svg aria-hidden="true" className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
              <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
            </svg>
          </div>
          <span className="sr-only">Loading...</span>
        </div>
        <div className='mt-3'>
          <p className='text-sm font-medium text-gray-900 dark:text-white'>This could take a bit...</p>
        </div>
      </div>
    </>
  )
}

function ClientPopUp({ client }) {
  return (
    <div className='p-2 flex flex-col text-xs'>
      <div>
        <span className='font-bold'>Domain:</span> {client.name}
      </div>
      <div>
        <span className='font-bold'>City:</span> {client.geo.city}
      </div>
      <div>
        <span className='font-bold'>Region:</span> {client.geo.region}
      </div>
      <div>
        <span className='font-bold'>Country:</span> {client.geo.country}
      </div>
      <div>
        <span className='font-bold'>Trnasferred:</span> {humanFileSize(client.value)}
      </div>
    </div>
  )
}

export default function OSDFMap() {
  const mapRef = useRef();
  const [cache, setCache] = useState(siteData.caches[0]);
  const cachesByClientRequest = useSWR('/api/cacheByClient?cache=' + cache.host, fetcher)
  const [clients, setClients] = useState([]);
  const cachesByClient = cachesByClientRequest.data
  const cachesByClientError = cachesByClientRequest.error
  const [selectedClient, setSelectedClient] = useState(null);
  if (cachesByClientError) console.log(cachesByClientError)

  useEffect(() => {
    if (cachesByClient) {
      setClients(combineClients(cachesByClient));
      //console.log("clients", clients);
    }
  }, [cachesByClient])

  if (cachesByClient) {
    //console.log(cachesByClient);
    //var combined = combineClients(cachesByClient);
    //setClients(combined);
    //console.log(combined);
  }

  // Sort the caches by region
  const cachesByRegion = useMemo(() => {
    const cachesByRegion = {};
    for (let i = 0; i < siteData.caches.length; i++) {
      let cache = siteData.caches[i];
      cache["index"] = i;
      const region = cache.region;
      if (region in cachesByRegion) {
        cachesByRegion[region].push(cache);
      } else {
        cachesByRegion[region] = [cache];
      }
    }
    return cachesByRegion;
  }, [siteData.caches]);

  const scaledCircles = useMemo(() => {
    const scaledCircles = new Array();
    // Find the larges of the client values
    const maxValue = Math.max(...clients.map(client => client.value));

    for (let i = 0; i < clients.length; i++) {
      let client = clients[i];
      const key = `${client.geo.city},${client.geo.region},${client.geo.country}`;
      const radius = Math.sqrt(client.value / maxValue) * 100000;
      const circleFeature = circle(
        [client.geo.ll[1], client.geo.ll[0]],
        radius,
        {
          units: 'meters',
          properties: {
            key: key,
            value: client.value,
            name: client.name,
          }
        });
      scaledCircles.push(circleFeature);
    }
    return scaledCircles;
  }, [clients]);

  var collection = featureCollection(scaledCircles);

  var circleLayerStyle = {
    'id': 'circleLayer',
    'type': 'fill',
    paint: {
      "fill-color": "blue",
      "fill-opacity": 0.5,
      "fill-outline-color": "blue",
    },
  }

  const columns = [
    {
      name: 'Location',
      selector: (row) => {
        if (row.geo.city && row.geo.region) {
          return `${row.geo.city}, ${row.geo.region}`;
        } else if (row.geo.city) {
          return row.geo.city;
        } else if (row.geo.region) {
          return row.geo.region;
        } else if (row.geo.country) {
          return row.geo.country;
        } else {
          return 'Unknown';
        }
      },
      sortable: true,
    },
    {
      name: 'Transferred',
      selector: row => row.value,
      format: row => humanFileSize(row.value),
      sortable: true,
    },
  ];

  return (
    <>
      <Head>
        <title>OSDF Maps</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <NavBar />
      <div className="grid grid-cols-3">
        <div className='col-span-2'>
          <div className='flex flex-col h-screen'>
            <div className='flex-grow'>
              <Map
                ref={mapRef}
                initialViewState={initialViewState}
                //mapStyle="mapbox://styles/mapbox/satellite-v9"
                //mapStyle="mapbox://styles/mapbox/dark-v10"
                mapStyle="mapbox://styles/mapbox/light-v10"
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                attributionControl={false}
                interactiveLayerIds={["circleLayer"]}
                onClick={(event) => {
                  console.log(event);
                  const features = mapRef.current.queryRenderedFeatures(event.point, { layers: ["circleLayer"] });
                  console.log(features);
                  if (features.length > 0) {
                    const feature = features[0];
                    // Find the client that matches the feature
                    const tmpSelectedClient = clients.find(client => client.name === feature.properties.name);
                    console.log(tmpSelectedClient);
                    setSelectedClient(tmpSelectedClient);
                  }
                }}
              >

                {cachesByClient && (
                  <Source id="client-circles" type="geojson" data={collection}>
                    <Layer {...circleLayerStyle} />
                  </Source>
                )}

                {selectedClient && (
                  <Popup
                    longitude={selectedClient.geo.ll[1]}
                    latitude={selectedClient.geo.ll[0]}
                    closeButton={true}
                    closeOnClick={true}
                    onClose={() => setSelectedClient(null)}
                    anchor="bottom"
                  >
                    <ClientPopUp client={selectedClient} />
                  </Popup>
                )}
                <Marker
                  longitude={cache.longitude}
                  latitude={cache.latitude}
                  anchor="center"
                >
                  <div className="bg-red-500 rounded-full p-1">
                    {cache.city}
                  </div>
                </Marker>
              </Map>
            </div>
          </div>
        </div>
        <div className='col-span-1 sidebar-shadow'>
          <div className='flex flex-col h-screen p-2'>
            <div className='flex flex-row items-center justify-center'>
              <label for="cache" className='basis-1/3 block text-sm font-medium text-gray-900 dark:text-white'>Choose a <span className='text-red-500'>Cache</span></label>
              <select name="cache"
                id="cache"
                className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                onChange={(e) => setCache(siteData.caches[e.target.value])}>
                {Object.keys(cachesByRegion).map((region, i) => {
                  return (
                    <optgroup label={region} key={region}>
                      {cachesByRegion[region].map((cache, j) => {
                        return (
                          <option value={cache.index} key={cache.index}>{cache.city}</option>
                        )
                      })}
                    </optgroup>
                  );
                })}
              </select>
            </div>
            { /* }
            {!cachesByClient && (
              <div role="status" className='mt-3'>
                <p className='text-sm font-medium text-gray-900 dark:text-white'>Loading clients...</p>
                <svg aria-hidden="true" className="mr-2 w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>
                <span className="sr-only">Loading...</span>
              </div>
            )}
            */ }
            <div className='mt-3'>
              <DataTable
                title="Clients in the last 30 days"
                columns={columns}
                data={clients}
                expandableRows
                expandableRowsComponent={ExpandedRow}
                dense
                progressPending={cachesByClient == undefined}
                progressComponent={DataTableLoading()}
                pagination
                defaultSortAsc={false}
                defaultSortFieldId={2} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

