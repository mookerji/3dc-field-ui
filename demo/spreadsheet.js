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

function renderLine(field) {
  return field ? field : "n/a";
}

function renderRecord(record) {
  console.log(record);
  const html =
    `<h3>` +
    record.hospital +
    `</h3>` +
    "<b> Clinician: </b>" +
    renderLine(record.clinician) +
    "<br>" +
    "<b>Phone: </b>" +
    renderLine(record.phone) +
    "<br>" +
    "<b>Email: </b>" +
    renderLine(record.email) +
    "<br>" +
    "<b>Address: </b>" +
    renderLine(record.address) +
    "<br>" +
    "<b> Delivery Date: </b>: " +
    renderLine(record.delivery_date) +
    "<br>" +
    "<b>Status: </b>" +
    renderLine(record.status) +
    "<br>" +
    "<b>Needed (S/M, L/XL): </b>" +
    (record.needed.sm + "," + record.needed.xl) +
    "<br>" +
    "<b>Shipped (S/M, L/XL): </b>" +
    (record.shipped.sm + "," + record.shipped.xl + "<br>");

  return html;
}
