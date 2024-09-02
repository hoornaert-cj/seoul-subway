// Initialize the map
var map = L.map('map').setView([37.5665, 126.9780], 11);

// Add tile layer
L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.png?api_key=22685591-9232-45c7-a495-cfdf0e81ab86', {
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

// Load the GeoJSON file for subway lines
var subwayLinesLayer;
fetch('data/seoul-subway-lines.geojson')
    .then(response => response.json())
    .then(data => {
        subwayLinesLayer = L.geoJSON(data, {
            style: function(feature) {
                return {
                    color: feature.properties.color, // Assuming 'color' is the hex color field in your GeoJSON
                    weight: 3
                };
            }
        });
        updateLayerVisibility(); // Initialize subway line visibility based on the current zoom level
    })
    .catch(error => console.error('Error loading GeoJSON for subway lines:', error));

// Load the GeoJSON file for stations but do not add to the map initially
var geojsonLayer;
fetch('data/seoul-subway-stations_v2.geojson')
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJSON(data, {
            pointToLayer: function(feature, latlng) {
                var marker = L.marker(latlng, {
                    icon: defaultIcon
                });

                var popupContent = `
                <b>
                    <a href="${feature.properties['link-kr']}" target="_blank">${feature.properties.name_kr}</a>
                    <img src="images/wiki-icon.svg" alt="Wiki Icon" class="wiki-icon">
                </b><br>
                <a href="${feature.properties['link-en']}" target="_blank">${feature.properties.name_en}</a>
                <img src="images/wiki-icon.svg" alt="Wiki Icon" class="wiki-icon">
            `;



                marker.bindPopup(popupContent, {
                    offset: [0, -10]
                });

                return marker;
            }
        });
        updateLayerVisibility(); // Initialize station marker visibility based on the current zoom level
    })
    .catch(error => console.error('Error loading GeoJSON for stations:', error));

// Function to update layer visibility based on zoom level
function updateLayerVisibility() {
    var zoomLevel = map.getZoom();

    if (zoomLevel <= 14) {
        if (subwayLinesLayer && !map.hasLayer(subwayLinesLayer)) {
            subwayLinesLayer.addTo(map);
        }
    } else {
        if (subwayLinesLayer && map.hasLayer(subwayLinesLayer)) {
            map.removeLayer(subwayLinesLayer);
        }
    }

    // Subway stations: visible only at zoom levels 14 and above
    if (zoomLevel >= 14) {
        if (geojsonLayer && !map.hasLayer(geojsonLayer)) {
            geojsonLayer.addTo(map);
        }
    } else {
        if (geojsonLayer && map.hasLayer(geojsonLayer)) {
            map.removeLayer(geojsonLayer);
        }
    }
}

// Add an event listener to handle zoom changes
map.on('zoomend', updateLayerVisibility);

// Function to zoom to a random station and change its marker icon
var previousMarker = null; // To keep track of the previously selected marker

function zoomToRandomStation() {
    if (geojsonLayer) {
        // Ensure the stations layer is added to the map before selecting a station
        if (!map.hasLayer(geojsonLayer)) {
            geojsonLayer.addTo(map);
        }

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
