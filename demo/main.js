const MAPBOX_TOKEN =
  "pk.eyJ1Ijoic3dpZnQtZGV2IiwiYSI6ImNrOGNsY3FhZjBoenYzZm4ycWpueGcyazEifQ.08Khig69QVbB5YUZeoWACQ";

mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [-71.0942, 42.3601],
  zoom: 9,
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

function geocode(geocoder, address, callback) {
  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      callback(results);
    } else {
      console.error("Whoops", status);
    }
  });
}

function listClinicianDemand() {
  const geocoder = new google.maps.Geocoder();
  gapi.client.sheets.spreadsheets.values
    .get({
      spreadsheetId: SHEET_ID2,
      range: "E3:P19",
    })
    .then(
      function (response) {
        const range = response.result;
        const limit = 10;
        console.log(range);
        range.values.slice(0, limit).map(function (row) {
          const record = parseRow(row);
          const address = record.address ? record.address : record.hospital;
          console.log(address);
          geocode(geocoder, address, function (r) {
            console.log(address, r[0]);
            const lat = r[0].geometry.location.lat();
            const lng = r[0].geometry.location.lng();
            const popup = new mapboxgl.Popup().setHTML(renderRecord(record));
            const marker = new mapboxgl.Marker({
              color: "purple",
            })
              .setLngLat([lng, lat])
              .setPopup(popup)
              .addTo(map);
          });
        });
      },
      function (response) {
        console.log("Error: " + response.result.error.message);
      }
    );
}

function init() {
  listClinicianDemand();
}
