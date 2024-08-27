// Initialize the map
var map = L.map('map').setView([37.5665, 126.9780], 11);

// Add tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
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

// Load the GeoJSON file and add it to the map
var geojsonLayer;
fetch('data/seoul-subway-stations_v2.geojson')
    .then(response => response.json())
    .then(data => {
        geojsonLayer = L.geoJSON(data, {
            pointToLayer: function (feature, latlng) {
                // Create a marker with the default icon
                var marker = L.marker(latlng, { icon: defaultIcon });

                  // Combine the Korean and English names in the popup
                  var popupContent = `<b>${feature.properties.name_kr}</b><br>${feature.properties.name_en}`;

                  // Bind a popup with the station names
                  marker.bindPopup(popupContent, {
                      offset: [0, -10] // Adjust the vertical offset as needed (e.g., -25 moves it up)
                  });

                  return marker;
            }
        }).addTo(map);
    })
    .catch(error => console.error('Error loading GeoJSON:', error));

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
