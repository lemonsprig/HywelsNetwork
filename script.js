image = {
  width: 4763,
  height: 3185,
};

// Declare map object

//const map = L.map("map").setView([0, 0], 3);
const map = L.map("map", {
  center: [0, 0],
  zoom: 6,
  crs: L.CRS.Simple,
});

// Rastercoords

const rc = new L.RasterCoords(map, [image.width, image.height]);
map.setMaxZoom(rc.zoomLevel());
map.setView(rc.unproject([image.width, image.height]), 3);

// Reference the tiles

L.tileLayer("maps/faerun/{z}/{x}/{y}.png", {
  minZoom: 1,
  maxZoom: 6,
  noWrap: true,
  bounds: rc.getMaxBounds(),
}).addTo(map);

// Markers and popups

let marker = L.marker([0, 0], { draggable: true }).addTo(map);
marker.bindPopup("Im a marker");

//let m2 = L.marker(map.unproject([694, 682], map.getMaxZoom())).addTo(map);

marker.on("dragend", function () {
  marker
    .getPopup()
    .setContent(
      `LatLng: ${marker.getLatLng().toString()} <br /> ${map.project(
        marker.getLatLng()
      )}`
    )
    .openOn(map);
});

// get our data

const geojsonOpts = {
  coordsToLatLng: function (coordinates) {
    return rc.unproject(coordinates);
  },

  pointToLayer: function (feature, latlng) {
    if (feature.properties.type === "exploited") {
      return L.circleMarker(latlng, {
        opacity: 1,
        title: feature.properties.name,
        radius: 4,
        fillColor: "#0096FF",
        fillOpacity: 1,
        color: "#0096FF",
      });
    } else {
      return L.circleMarker(latlng, {
        opacity: 1,
        title: feature.properties.name,
        radius: 4,
        fillColor: "#FF0000",
        fillOpacity: 1,
        color: "#FF0000",
      });
    }
  },

  onEachFeature: function (feature, layer) {
    let detail = `Name: ${feature.properties.name} <br /> Intel: ${feature.properties.intel}`;

    layer.bindPopup(detail);
  },
};

async function getData() {
  // await the response of the fetch call
  const response = await fetch("./Data/network.json");
  // only proceed once the fetch is resolved
  const data = await response.json();
  // only proceed once the second promise is resolved
  return data;
}

getData().then((data) => L.geoJSON(data, geojsonOpts).addTo(map));

// add a GeoJSON layer
//L.geoJSON(data).addTo(map);
