const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFza3Nvbi1pbnRlcm5hbCIsImEiOiJjazhxdTNjOXAwN3NsM2RwaDJkaWU1MGV4In0.91Sfq6oHaoP-kD6fV-shFA";

mapboxgl.accessToken = MAPBOX_TOKEN;

if (!mapboxgl.supported()) {
  alert("Your browser does not support Mapbox GL");
}

const map = new mapboxgl.Map({
  container: "map",
  //  style: "mapbox://styles/maskson-internal/ck8qye4uf059t1ipsdcdtcy90",
  style: "mapbox://styles/mapbox/light-v10",
  center: [-98, 38.88],
  minZoom: 2,
  attributionControl: false,
});

map.addControl(
  new mapboxgl.AttributionControl({
    compact: false,
    customAttribution:
      "Data courtesy <a href='https://tulip.co'> Tulip Interfaces</a>",
  })
);

const filterGroup = document.getElementById("filter-group");

const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

map.on("load", function () {
  init();
});

let lastId;

function entityToHTML(properties) {
  const {
    county,
    quantity = 0,
    quantity_type = "n/a",
    created_at = "n/a",
  } = properties;
  return `<p><b>County</b>: ${county}<br><b/>Quantity Type</b>: ${quantity_type}<br><b/>Quantity</b>: ${quantity}<br><b/>Created At</b>: ${created_at}</p>`;
}

function handleMove(e) {
  const id = e.features[0].properties.county;
  if (id !== lastId) {
    lastId = id;
    map.getCanvas().style.cursor = "pointer";
    const coordinates = e.features[0].geometry.coordinates.slice();
    const HTML = entityToHTML(e.features[0].properties);
    popup.setLngLat(coordinates).setHTML(HTML).addTo(map);
  }
}

function handleLeave(e) {
  lastId = undefined;
  map.getCanvas().style.cursor = "";
  popup.remove();
}

// TODO(mookerji): Refactor all this

map.on("mousemove", "demand", (e) => {
  handleMove(e);
});

map.on("mouseleave", "demand", function (e) {
  handleLeave(e);
});

map.on("mousemove", "supply", (e) => {
  handleMove(e);
});

map.on("mouseleave", "supply", function (e) {
  handleLeave(e);
});

map.on("mousemove", "counties", function (e) {
  map.getCanvas().style.cursor = "pointer";
  var feature = e.features[0];
  popup.setLngLat(e.lngLat).setText(feature.properties.COUNTY).addTo(map);
});

map.on("mouseleave", "counties", function () {
  map.getCanvas().style.cursor = "";
  popup.remove();
});

function addLayerSelect(layer_id, checked = true) {
  var input = document.createElement("input");
  input.type = "checkbox";
  input.id = layer_id;
  input.checked = checked;
  filterGroup.appendChild(input);

  var label = document.createElement("label");
  label.setAttribute("for", layer_id);
  label.textContent = layer_id;
  filterGroup.appendChild(label);

  input.addEventListener("change", function (e) {
    map.setLayoutProperty(
      layer_id,
      "visibility",
      e.target.checked ? "visible" : "none"
    );
  });
}

async function init() {

  const res = await fetch('https://4hmd1l6e32.execute-api.us-east-1.amazonaws.com/api');
  let aggregated = await res.json();

  map.addSource("aggregated", {
    type: "geojson",
    data: aggregated
  });
  map.addSource("counties", {
    type: "vector",
    url: "mapbox://mapbox.82pkq93d",
  });

  map.addLayer({
    id: "demand",
    source: "aggregated",
    type: "circle",
    maxzoom: 10,
    paint: {
      "circle-opacity": [
        "interpolate",
        ["linear"],
        ["get", "quantity"],
        25, 0.35,
        50, 0.45,
        100, 0.55,
        200, 0.65,
        300, 0.75
      ],
      "circle-stroke-width": 0.8,
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["get", "quantity"],
        10, 3,
        50, 5,
        100, 10,
        300, 15,
        500, 20,
        1000, 25,
        5000, 30,
        10000, 35,
        100000, 40
      ],
      "circle-color": '#e02d19',
    },
    filter: ["==", "entity_type", "demand"],
  });
  addLayerSelect("demand");

  map.addLayer({
    id: "supply",
    maxzoom: 10,
    source: "aggregated",
    type: "circle",
    paint: {
      "circle-opacity": 1,
      "circle-stroke-width": 0.8,
      "circle-radius": 6,
      "circle-color": "#1fb50e",
    },
    filter: ["==", "entity_type", "supply"],
  });
  addLayerSelect("supply");

  map.addLayer(
    {
      id: "counties",
      type: "fill",
      source: "counties",
      "source-layer": "original",
      paint: {
        "fill-outline-color": "rgba(0,0,0,0.2)",
        "fill-color": "rgba(0,0,0,0.1)",
      },
      layout: {
        visibility: "none",
      },
    },
    "settlement-label"
  );
  addLayerSelect("counties", false);
}
