const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFza3Nvbi1pbnRlcm5hbCIsImEiOiJjazhxdTNjOXAwN3NsM2RwaDJkaWU1MGV4In0.91Sfq6oHaoP-kD6fV-shFA";

mapboxgl.accessToken = MAPBOX_TOKEN;

if (!mapboxgl.supported()) {
  alert("Your browser does not support Mapbox GL");
}

const map = new mapboxgl.Map({
  container: "map",
  //  style: "mapbox://styles/maskson-internal/ck8qye4uf059t1ipsdcdtcy90",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-98, 38.88],
  minZoom: 2,
  zoom: 3
});

const filterGroup = document.getElementById("filter-group");

const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

map.on("load", function () {
  init();
});

let lastId;

function recipientToHTML(properties) {
  const {
    name,
    vicinity,
    contact_name = "n/a",
    contact_email = "n/a",
    created_at = "n/a",
    status = "n/a",
  } = properties;
  return `<p><b>Name</b>: ${name}<br><b/>Address</b>: ${vicinity}<br><b/>Contact</b>: ${contact_name}<br><b/>Email</b>: ${contact_email}<br><b/>Created At</b>: ${created_at}<br><b/>Status</b>: ${status}</p>`;
}

function handleMove(e) {
  const id = e.features[0].properties.name;
  if (id !== lastId) {
    lastId = id;
    map.getCanvas().style.cursor = "pointer";
    const coordinates = e.features[0].geometry.coordinates.slice();
    const HTML = recipientToHTML(e.features[0].properties);
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

function addLayerSelect(layer_id) {
  var input = document.createElement("input");
  input.type = "checkbox";
  input.id = layer_id;
  input.checked = true;
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

function init() {
  map.addSource("data", {
    type: "geojson",
    data:
      "https://raw.githubusercontent.com/mookerji/3dc-field-ui/master/demand.json",
  });
  map.addSource('counties', {
      'type': 'vector',
      'url': 'mapbox://mapbox.82pkq93d'
  });
  map.addLayer({
    id: "demand",
    source: "data",
    type: "circle",
    paint: {
      "circle-opacity": 0.85,
      "circle-stroke-width": 0.8,
      "circle-radius": 6,
      "circle-color": "#FFEB3B",
    },
    filter: ["==", "entity_type", "recipient"],
  });
  map.addLayer({
    id: "supply",
    source: "data",
    type: "circle",
    paint: {
      "circle-opacity": 0.85,
      "circle-stroke-width": 0.8,
      "circle-radius": 6,
      "circle-color": "#007cbf",
    },
    filter: ["==", "entity_type", "warehouse"],
  });
  addLayerSelect("demand");
  addLayerSelect("supply");
}
