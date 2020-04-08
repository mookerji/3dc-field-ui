const MAPBOX_TOKEN =
  "pk.eyJ1IjoibWFza3Nvbi1pbnRlcm5hbCIsImEiOiJjazhxdTNjOXAwN3NsM2RwaDJkaWU1MGV4In0.91Sfq6oHaoP-kD6fV-shFA";

mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
    //  style: "mapbox://styles/maskson-internal/ck8qye4uf059t1ipsdcdtcy90",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-122.4639339,37.7758159],
  zoom: 7,
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

function init() {
  console.log("loaded!");
}
