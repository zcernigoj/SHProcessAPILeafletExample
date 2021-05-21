const center = [37.75, 15]; // lat/lng in EPSG:4326 (starting point of the map)
const fromDate = '2021-01-01T00:00:00Z'; // ISO 8601
const toDate = '2021-03-29T23:59:59Z'; // ISO 8601
const collectionId = "sentinel-2-l1c"; // collection ids in the documentation
const datasetId = "S2L1C"; // dataset ids in the documentation
const evalscriptTrueColor = `//VERSION=3
//TRUE COLOR

let minVal = 0.0;
let maxVal = 0.4;
let viz = new HighlightCompressVisualizer(minVal, maxVal);

function evaluatePixel(samples) {
  let val = [samples.B04, samples.B03, samples.B02];
  val = viz.processList(val);
  val.push(samples.dataMask);
  return val;
}

function setup() {
  return {
    input: [{bands: ["B02","B03","B04","dataMask"]}],
    output: {bands: 4}
  }
}
`;

let authToken = null;
let map = null;

function getDatesForCurrentView() {
  // get current bbox
  const bounds = map.getBounds();
  const bbox = bounds.toBBoxString().split(',');
  console.log('bounds', { bounds, bbox });

  // get dates for current bbox
  getDates(authToken, bbox, fromDate, toDate, collectionId).then(dates => {
    // dates are now in ascending order (from older to newer)
    console.log("all the dates for the parameters, older first", { dates });

    // .sort() sorts in-place, so we need to first copy the array into a new one and then sort
    const datesFromNewerToOlder = [...dates].sort((a, b) => (new Date(b).getTime() - new Date(a).getTime()));
    console.log('all the dates for the parameters, newer first', { datesFromNewerToOlder });

    const datesListElement = document.getElementById('dates-list');
    datesListElement.innerHTML = "";

    for (date of datesFromNewerToOlder) {
      const dateEl = document.createElement('p');
      const dateObj = new Date(date);

      const formatedDate = dateObj.getDate() + '.' + (dateObj.getMonth() + 1) + '.' + dateObj.getFullYear();
      dateEl.innerText = formatedDate;
      datesListElement.appendChild(dateEl);
    }
  });
}

window.onload = async (event) => {
  // get auth token
  authToken = await getAuthToken(CLIENT_ID, CLIENT_SECRET);
  console.log("token:", authToken);

  // Sentinel Hub's Sentinel-2 L1C True color layer
  const shS2L1CTrueColor = L.gridLayer.shProcessLayer({
    authToken: authToken,
    dataset: datasetId,
    evalscript: evalscriptTrueColor,
  });

  // OpenStreetMap layer:
  let osm = L.tileLayer("http://{s}.tile.osm.org/{z}/{x}/{y}.png", {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
  });

  // configure Leaflet:
  let baseMaps = {
    OpenStreetMap: osm,
  };
  let overlayMaps = {
    "True Color": shS2L1CTrueColor,
  };

  map = L.map("map", {
    center: center,
    zoom: 15,
    layers: [osm, shS2L1CTrueColor],
  });
  L.control.layers(baseMaps, overlayMaps).addTo(map);
};