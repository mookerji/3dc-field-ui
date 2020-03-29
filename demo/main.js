const MAPBOX_TOKEN =
  "pk.eyJ1Ijoic3dpZnQtZGV2IiwiYSI6ImNrOGNsY3FhZjBoenYzZm4ycWpueGcyazEifQ.08Khig69QVbB5YUZeoWACQ";

const GAPPS = {
  CLIENT_ID:
    "862818247748-pmrqh266vvb3r530en06kkgp5tttpvbu.apps.googleusercontent.com",
  API_KEY: "AIzaSyAMiSm_Pgtd1BHxJew_Ff7telRc2Zc6lJM",
  DISCOVERY_DOCS: ["https://sheets.googleapis.com/$discovery/rest?version=v4"],
  SCOPES: "https://www.googleapis.com/auth/spreadsheets.readonly",
};

const SHEET_ID2 = "1ApldMhIqucqj86MxbV9T1HTai2z96SRSrddaXcHQG0Y";

const authorizeButton = document.getElementById("authorize_button");
const signoutButton = document.getElementById("signout_button");

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

function handleClientLoad() {
  gapi.load("client:auth2", initClient);
}

function initClient() {
  gapi.client
    .init({
      apiKey: GAPPS.API_KEY,
      clientId: GAPPS.CLIENT_ID,
      discoveryDocs: GAPPS.DISCOVERY_DOCS,
      scope: GAPPS.SCOPES,
    })
    .then(
      function () {
        gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
        updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
        authorizeButton.onclick = handleAuthClick;
        signoutButton.onclick = handleSignoutClick;
      },
      function (error) {
        console.log(JSON.stringify(error, null, 2));
      }
    );
}

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = "none";
    signoutButton.style.display = "block";
  } else {
    authorizeButton.style.display = "block";
    signoutButton.style.display = "none";
  }
}

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

function geocode(geocoder, address, callback) {
  geocoder.geocode({ address: address }, function (results, status) {
    if (status === "OK") {
      callback(results);
    } else {
      console.error("Whoops", status);
    }
  });
}

function parseRow(row) {
  return {
    hospital: row[0] + " " + row[1],
    clinician: row[6],
    address: row[9],
    phone: row[7],
    email: row[8],
    delivery_date: row[10],
    status: row[11],
    needed: {
      sm: row[2],
      xl: row[3],
    },
    shipped: {
      sm: row[4],
      xl: row[5],
    },
  };
}

function renderRecord(record) {
  console.log(record);
  const html =
    `<h3>` +
    record.hospital +
    `</h3>` +
    "<b> Clinician: </b>" +
    (record.clinician ? record.clinician : "n/a") +
    "<br>" +
    "<b>Phone: </b>" +
    (record.phone ? record.phone : "n/a") +
    "<br>" +
    "<b>Email: </b>" +
    (record.email ? record.email : "n/a") +
    "<br>" +
    "<b>Address: </b>" +
    (record.address ? record.address : "n/a") +
    "<br>" +
    "<b> Delivery Date: </b>: " +
    (record.delivery_date ? record.delivery_date : "n/a") +
    "<br>" +
    "<b>Status: </b>" +
    (record.status ? record.status : "n/a") +
    "<br>" +
    "<b>Needed (S/M, L/XL): </b>" +
    (record.needed.sm + "," + record.needed.xl) +
    "<br>" +
    "<b>Shipped (S/M, L/XL): </b>" +
    (record.shipped.sm + "," + record.shipped.xl + "<br>");

  return html;
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
