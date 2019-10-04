let map;
// Create a new blank array for all the listing markers.
const markers = [];
let infoWindow = null;

const placeModel = [
    { title: 'Clifton Sea View', location: { lat: 24.789667, lng: 67.04386}},
    { title: 'Mazaar–e–Quaid', location: { lat: 24.874553, lng: 67.039813 }},
    { title: 'Mohatta Palace', location: { lat: 24.814236, lng: 67.032993 } },
    { title: 'Charna Island', location: { lat: 24.8967716, lng: 66.594808 } },
    { title: 'Barrett Hodgson University', location: { lat: 24.7994988, lng: 67.1091056 } },
];

// place data model
const Place = function(data) {
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.location.lat);
    this.lng = ko.observable(data.location.lng);
};

// Here's my view model
const ViewModel = function () {
    let self = this;
    this.placeList = ko.observableArray([]);
    this.query = ko.observable('');

    placeModel.forEach((item) => {
        this.placeList.push(new Place(item));
    });
    // everytime query/placeList changes, this gets computed again
    self.filteredPlaces = ko.computed(function () {
        if (!self.query()) {
            // visible all markers
            for (let i = 0; i < markers.length; i++) {
                markers[i].setVisible(true);
            }
            return self.placeList();
        } else {
            // if query changes, infoWindow close
            if (infoWindow) {
                infoWindow.close();
            }

            // computed filter place list when query changes
            const filteredList = self.placeList()
                .filter(place => place.title().toLowerCase().indexOf(self.query().toLowerCase()) > -1);
            const filteredListTitle = [];
            for (let i = 0; i < filteredList.length; i++) {
                filteredListTitle.push(filteredList[i].title().toLowerCase());
            }

            // computed filter markers when query changes
            for (let i = 0; i < markers.length; i++) {
                if (filteredListTitle.includes(markers[i].title.toLowerCase())) {
                    markers[i].setVisible(true);
                }
                else {
                    markers[i].setVisible(false);
                }
            }

            return self.placeList()
                .filter(place => place.title().toLowerCase().indexOf(self.query().toLowerCase()) > -1);
        }
    });

    // open infoWindow when click events on list items
    self.openInfoWindow = function(place) {
        markers.forEach(marker => {
            if (place.title().toLowerCase() == marker.title.toLowerCase()) {
                google.maps.event.trigger(marker, 'click');
            }
        });
    };
};

ko.applyBindings(new ViewModel()); // This makes Knockout get to work


function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: placeModel[0].location.lat, lng: placeModel[0].location.lng},
        zoom: 13,
    });
    infoWindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (let i = 0; i < placeModel.length; i++) {
        // Get the position from the location array.
        const position = placeModel[i].location;
        const title = placeModel[i].title;
        // Create a marker per location, and put into markers array.
        const marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function () {
            populateInfoWindow(this, infoWindow);
        });
    }

    // This will loop through the markers array and display them all.
    const bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}

// This function populates the infowindow when the marker is clicked. We'll only allow
// one infowindow which will open at the marker that is clicked, and populate based
// on that markers position.
function populateInfoWindow(marker, infowindow) {
    // Check to make sure the infowindow is not already opened on this marker.
    if (infowindow.marker != marker) {
        // Clear the infowindow content.
        infowindow.setContent('');
        infowindow.marker = marker;
        // Make sure the marker property is cleared if the infowindow is closed.
        infowindow.addListener('closeclick', function () {
            infowindow.marker = null;
        });
        infowindow.setContent('<div>' + marker.title + '</div>');
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}
