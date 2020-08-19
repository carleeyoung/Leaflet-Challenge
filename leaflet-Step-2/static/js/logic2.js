// Store our earthquakes API endpoint inside queryUrl
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Store our techtonic plates API endpoint inside platesUrl
var platesURL = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(queryUrl, function(data) {
  // Once we get a response, send the data.features object to the createFeatures function
  createFeatures(data.features);
});

// getColor will run for setting up the circle marker colors
function getColor(d) {
  return d > 7 ? '#800026' :
         d > 6  ? '#BD0026' :
         d > 5  ? '#E31A1C' :
         d > 4  ? '#FC4E2A' :
         d > 3  ? '#FD8D3C' :
         d > 2  ? '#FEB24C' :
         d > 1  ? '#FED976' :
                    '#FFEDA0';
};

function createFeatures(earthquakeData) {
// earthquake data
  function onEachFeature(feature, layer) {
    // bind popup to marker
    layer.bindPopup(`<h3>${feature.properties.place}</h3><h4>Magnitude ${feature.properties.mag}</h4><p>${new Date(feature.properties.time)}</p>`);
  }
      earthquakes = L.geoJSON(earthquakeData, {
          
        onEachFeature: onEachFeature,
        // create circle markers for each earthquake
        pointToLayer: function (feature, latlng) {
          return L.circleMarker(latlng, {
                      stroke: false,
                      fillOpacity: 0.75,
                      color: "red",
                      fillColor: getColor(feature.properties.mag),
                      radius: feature.properties.mag * 5
                      }) 
                    }
                  })
// techtonic plate data
d3.json(platesURL, function(data) {
  // Once we get a response, send the data.features object to the createPlates function
  createPlates(data.features);
});

function createPlates(platesData){
  function onEachFeature(feature, layer) {
        // Coordinates for each point to be used in the polyline
        var line = [feature.geometry.coordinates];
  }
        plates = L.geoJSON(platesData, {
          onEachFeature: onEachFeature,
          // use line coordinates to draw techtonic plate boundaries
          pointToLayer: function (feature, latlng) {
            return L.polyline(line, {
            }) 
        }
  })
  // send earthquake and plate data to createMap function
  createMap(earthquakes, plates)
};
};

function createMap(earthquakes, plates) {
  
  // Define streetmap and satellite layers
  var streetmap = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  });

  var satellite = L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/satellite-v9",
    accessToken: API_KEY
  });

  // Define a baseMaps and overLay objects to hold our base layers
  var baseMaps = {
    "Street Map": streetmap,
    "Satellite": satellite
  };

  var overlayMaps = {
    Earthquakes: earthquakes,
    TechtonicPlates: plates
  };

  // Create our map, giving it the satellite, earthquakes and plates layers to display on loading
  var myMap = L.map("map", {
    center: [
      0, 0
    ],
    zoom: 3,
    layers: [satellite, earthquakes, plates]
  });
  
  // add control layers to map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);
  
  // Set up the legend
  var legend = L.control({ position: "bottomright" });
  legend.onAdd = function() {
    var div = L.DomUtil.create("div", "info legend");
    var limits = [0, 1, 2, 3, 4, 5, 6, 7];
    var colors = ['#FFEDA0', '#FED976', '#FEB24C','#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];
    var labels = [];

    // Add min & max
    var legendInfo = "<h2>Earthquake Magnitude</h2>" +
      "<div class=\"labels\"></div>";

    div.innerHTML = legendInfo;

    limits.forEach(function(limit, index) {
      labels.push(`<li style="background-color: ${colors[index]} ">${limits[index]}</li>`);
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  // Add legend to the map
  legend.addTo(myMap);
};