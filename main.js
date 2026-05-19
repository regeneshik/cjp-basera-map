/* global L Papa */

let pointsURL =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwSJivUX4DG3akMaW8JxBe6ZcdNptSYTetansOenBFHgDW_kQrLDYpwThiIpPw43xf_EIPUhzIXz55/pub?output=csv";

window.addEventListener("DOMContentLoaded", init);

let map;
let sidebar;
let panelID = "my-info-panel";

function init() {
  // Centered on India
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

  sidebar = L.control
    .sidebar({
      container: "sidebar",
      closeButton: true,
      position: "right",
    })
    .addTo(map);

  let panelContent = {
    id: panelID,
    tab: "<i class='fa fa-bars active'></i>",
    pane: "<p id='sidebar-content'></p>",
    title: "<h2 id='sidebar-title'>🪳 CJP Basera Map</h2>",
  };
  sidebar.addPanel(panelContent);

  map.on("click", function () {
    sidebar.close(panelID);
  });

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

    // Skip rows with no coordinates
    if (!d.lat || !d.lng || isNaN(parseFloat(d.lat))) continue;

    let icon = L.AwesomeMarkers.icon({
      icon: "bug",           // cockroach-closest Font Awesome icon
      iconColor: "white",
      markerColor: "red",    // CJP red
      prefix: "fa",
    });

    let marker = L.marker([parseFloat(d.lat), parseFloat(d.lng)], {
      icon: icon,
    });

    marker.addTo(pointGroupLayer);

    // Sidebar content on click
    marker.on("click", function (e) {
      L.DomEvent.stopPropagation(e);

      document.getElementById("sidebar-title").innerHTML =
        "🪳 " + (d.name || "Basera");

      document.getElementById("sidebar-content").innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-family:sans-serif; font-size:14px;">
          <tr><td><b>Locality</b></td><td>${d.locality || "—"}</td></tr>
          <tr><td><b>City</b></td><td>${d.city || "—"}</td></tr>
          <tr><td><b>State</b></td><td>${d.state || "—"}</td></tr>
          <tr><td><b>Instagram</b></td><td>${
            d.instagram
              ? `<a href="https://instagram.com/${d.instagram.replace("@", "")}" target="_blank">${d.instagram}</a>`
              : "—"
          }</td></tr>
          <tr><td><b>Members</b></td><td>${d.members || "—"}</td></tr>
        </table>
      `;

      sidebar.open(panelID);
    });
  }
}
