// Initialize the map
var map = L.map('map').setView([37.5665, 126.9780], 11);

// Add tile layer
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>',
}).addTo(map);

// Define marker icons
var defaultIcon = L.icon({
    iconUrl: 'images/metro.png', // Replace with the path to your default icon
    iconSize: [15, 15] // Size of the icon
});

var selectedIcon = L.icon({
    iconUrl: 'images/metro-selected.png', // Replace with the path to your unique icon
    iconSize: [35, 35] // Size of the icon
});

var geojsonLayer; // Layer for subway stations
var subwayLinesLayer; // Layer for subway lines

// Load the GeoJSON file for subway stations
fetch('data/seoul-subway-stations_v2.geojson')
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                var marker = L.marker(latlng, { icon: defaultIcon });

                var popupContent = `<b><a href="${feature.properties['link-kr']}" target="_blank">${feature.properties.name_kr}</a></b><br>
                                    <a href="${feature.properties['link-en']}" target="_blank">${feature.properties.name_en}</a>`;

                marker.bindPopup(popupContent, {
                    offset: [0, -10]
                });

                return marker;
            }
        });
        // Initially hide the stations layer
        geojsonLayer.addTo(map);
        geojsonLayer.eachLayer(function (layer) {
            layer.removeFrom(map);
        });
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

// Load the GeoJSON file for subway lines
fetch('data/seoul-subway-lines.geojson')
    .then(response => response.json())
    .then(data => {
        subwayLinesLayer = L.geoJSON(data, {
            style: function (feature) {
                return {
                    color: feature.properties.color,  // Use the color property from the GeoJSON for line color
                    weight: 4,  // Line thickness
                    opacity: 0.8  // Line opacity
                };
            }
        }).addTo(map);  // Add subway lines to the map by default
    })
    .catch(error => console.error('Error loading subway lines GeoJSON:', error));

// Function to zoom to a random station and change its marker icon
var previousMarker = null; // To keep track of the previously selected marker

function zoomToRandomStation() {
    if (geojsonLayer) {
        var features = geojsonLayer.getLayers();
        if (features.length > 0) {
            var randomIndex = Math.floor(Math.random() * features.length);
            var randomFeature = features[randomIndex];

            if (randomFeature instanceof L.Marker) {
                // If there's a previously selected marker, revert its icon
                if (previousMarker) {
                    previousMarker.setIcon(defaultIcon);
                }

                // Set the unique icon for the randomly selected marker
                randomFeature.setIcon(selectedIcon);

                // Open the popup to show the name of the station
                randomFeature.openPopup();

                // Zoom to the selected marker
                map.setView(randomFeature.getLatLng(), 16);

                // Show the reset view button
                document.getElementById('resetViewButton').style.display = 'block';

                // Update the previous marker reference
                previousMarker = randomFeature;
            } else {
                console.error('The selected feature is not a marker.');
            }
        } else {
            console.error('No features found in GeoJSON layer.');
        }
    } else {
        console.error('GeoJSON layer not loaded yet.');
    }
}

// Function to reset the map view to the initial extent
function resetMapView() {
    map.setView([37.5665, 126.9780], 11); // Reset to the initial view

    // Hide the reset view button after resetting the view
    document.getElementById('resetViewButton').style.display = 'none';

    // If there's a previously selected marker, revert its icon
    if (previousMarker) {
        previousMarker.setIcon(defaultIcon);
        previousMarker.closePopup();
        previousMarker = null;
    }
}

// Event listeners for buttons
document.getElementById('randomStationButton').addEventListener('click', zoomToRandomStation);
document.getElementById('resetViewButton').addEventListener('click', resetMapView);

// Add event listener to control layer visibility based on zoom level
map.on('zoomend', function() {
    var currentZoom = map.getZoom();

    if (currentZoom >= 14) {
        if (!map.hasLayer(geojsonLayer)) {
            map.addLayer(geojsonLayer);
        }
    } else {
        if (map.hasLayer(geojsonLayer)) {
            map.removeLayer(geojsonLayer);
        }
    }

    if (currentZoom < 14) {
        if (!map.hasLayer(subwayLinesLayer)) {
            map.addLayer(subwayLinesLayer);
        }
    } else {
        if (map.hasLayer(subwayLinesLayer)) {
            map.removeLayer(subwayLinesLayer);
        }
    }
});
