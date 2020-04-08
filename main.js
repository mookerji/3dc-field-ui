const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFza3Nvbi1pbnRlcm5hbCIsImEiOiJjazhxdTNjOXAwN3NsM2RwaDJkaWU1MGV4In0.91Sfq6oHaoP-kD6fV-shFA";

mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  //  style: "mapbox://styles/maskson-internal/ck8qye4uf059t1ipsdcdtcy90",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-122.4639339, 37.7758159],
  zoom: 11,
});

const popup = new mapboxgl.Popup({
  closeButton: false,
  closeOnClick: false,
});

map.on("load", function () {
  init();
});

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
  })
);

let lastId;

map.on("mousemove", "circles", (e) => {
  const id = e.features[0].properties.name;
  if (id !== lastId) {
    lastId = id;
    map.getCanvas().style.cursor = "pointer";
    const { name, vicinity } = e.features[0].properties;
    const coordinates = e.features[0].geometry.coordinates.slice();
    const HTML = `<p><b>Name</b>: ${name}<br><b/>Address</b>: ${vicinity}</p>`;
    popup.setLngLat(coordinates).setHTML(HTML).addTo(map);
  }
});

map.on("mouseleave", "circles", function () {
  lastId = undefined;
  map.getCanvas().style.cursor = "";
  popup.remove();
});

function init() {
  map.addSource("demand", {
    type: "geojson",
    data:
      "https://raw.githubusercontent.com/mookerji/3dc-field-ui/master/demand.json",
  });
  map.addLayer({
    id: "circles",
    source: "demand",
    type: "circle",
    paint: {
      "circle-opacity": 0.75,
      "circle-stroke-width": 1,
      "circle-radius": 6,
      "circle-color": "#FFEB3B",
    },
  });
}
