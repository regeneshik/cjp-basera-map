/* global L Papa */

let pointsURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwSJivUX4DG3akMaW8JxBe6ZcdNptSYTetansOenBFHgDW_kQrLDYpwThiIpPw43xf_EIPUhzIXz55/pub?gid=925963632&single=true&output=csv";

window.addEventListener("DOMContentLoaded", init);

let map;

function init() {
  map = L.map("map").setView([22.5, 80.0], 5);

  L.tileLayer(
    "https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}{r}.png",
    {
      attribution:
        "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> &copy; <a href='http://cartodb.com/attributions'>CartoDB</a>",
      subdomains: "abcd",
      maxZoom: 19,
    }
  ).addTo(map);

  Papa.parse(pointsURL, {
    download: true,
    header: true,
    complete: addPoints,
  });
}

function addPoints(data) {
  data = data.data;
  let pointGroupLayer = L.layerGroup().addTo(map);

  for (let row = 0; row < data.length; row++) {
    let d = data[row];

    let name      = d["Basera name"] || "Basera";
    let locality  = d["Locality / Mohalla"] || "—";
    let citystate = d["City & State"] || "—";
    let instagram = d["Instagram handle"] || "";
    let members   = d["Number of members so far"] || "—";
    let lat       = parseFloat(d["lat"]);
    let lng       = parseFloat(d["lng"]);

    if (!lat || !lng || isNaN(lat)) continue;

    let icon = L.AwesomeMarkers.icon({
      icon: "bug",
      iconColor: "white",
      markerColor: "red",
      prefix: "fa",
    });

    let marker = L.marker([lat, lng], { icon: icon });
    marker.addTo(pointGroupLayer);

    let popupContent = `
      <h3>🪳 ${name}</h3>
      <table style="font-family:sans-serif; font-size:13px; line-height:1.8; width:100%;">
        <tr><td><b>Locality</b></td><td>${locality}</td></tr>
        <tr><td><b>City / State</b></td><td>${citystate}</td></tr>
        <tr><td><b>Instagram</b></td><td>${
          instagram
            ? `<a href="https://instagram.com/${instagram.replace("@","")}" target="_blank">${instagram}</a>`
            : "—"
        }</td></tr>
        <tr><td><b>Members</b></td><td>${members}</td></tr>
      </table>
    `;

    marker.bindPopup(popupContent, { maxWidth: 250 });
  }
}
