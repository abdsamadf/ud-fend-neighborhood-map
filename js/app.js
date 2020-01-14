// Recommended class is to store data from Foursquare API
class RecommendedPlace {
    constructor(placeJSON) {
        this.address = placeJSON.venue.location.address;
        this.placeName = placeJSON.venue.name;
        this.location = { lat: placeJSON.venue.location.lat, lng: placeJSON.venue.location.lng};
        this.categoryType = placeJSON.venue.categories[0].name;
    }
}

// retrieve places asynchronously from Foursquare exploreApi
function retrievePlacesFoursquareAPI() {
    const client_id = 'HDUNL52NGCNNDRRSWIVAXVT2DT3FHJMIPIJQ4XHHFD32J2IL';
    const client_secret = 'QC4CKK0Z2X14QZSQ1A0IRZEWJGGZ10UE4TMSPSRAWTOA05HU';
    const api_version = '20191013';

    // https://developer.foursquare.com/docs/api/venues/explore
    const exploreAPI = 'https://api.foursquare.com/v2/venues/explore';
    const nearCity = 'Karachi';
    const query = 'food';
    const venueRecommendationRequestURL = `${exploreAPI}?client_id=${client_id}&client_secret=${client_secret}&v=${api_version}&near=${nearCity}&query=${query}&limit=10`;

    return fetch(venueRecommendationRequestURL)
           .then(response => response.json())
           .then(json => json.response.groups[0].items)
           .then(items => items.filter(item => item.venue.location.address != undefined))
           .catch(() => window.alert("failed to load"));
}

let map;
// Create a new blank array for all the listing markers.
const markers = [];
let infoWindow = null;

// Create a new blank array for all the recommended places.
const placeModel = [];

async function initPlaces() {
    const json = await retrievePlacesFoursquareAPI();

    json.forEach(item => {
        placeModel.push(new RecommendedPlace(item));
    });
}


// place data model
const Place = function(data) {
    this.title = ko.observable(data.placeName);
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
    self.openInfoWindow = function (place, event) {
        let previousSelectedItem = document.querySelector('.mdl-navigation__link--current');
        if (previousSelectedItem != null) previousSelectedItem.classList.remove('mdl-navigation__link--current');

        markers.forEach(marker => {
            if (place.title().toLowerCase() == marker.title.toLowerCase()) {
                setMarkerAnimation(marker);
                google.maps.event.trigger(marker, 'click');
                event.target.classList.add('mdl-navigation__link--current');
            }
        });
    };
};


function setMarkerAnimation(marker) {
    marker.setAnimation(google.maps.Animation.BOUNCE);
    // bounce stops after 1.5 second
    setTimeout(() => marker.setAnimation(null), 1500);
}

// https://discussions.udacity.com/t/handling-google-maps-in-async-and-fallback/34282
function googleMapError() {
	window.alert("google map failed to load");
}

async function initMap() {
    await initPlaces();
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: placeModel[0].location.lat, lng: placeModel[0].location.lng},
        zoom: 13,
    });
    infoWindow = new google.maps.InfoWindow();

    // The following group uses the location array to create an array of markers on initialize.
    for (let i = 0; i < placeModel.length; i++) {
        // Get the position from the location array.
        const position = placeModel[i].location;
        const placeName = placeModel[i].placeName;
        const address = placeModel[i].address;
        const categoryType = placeModel[i].categoryType;

        // Create a marker per location, and put into markers array.
        const marker = new google.maps.Marker({
            position: position,
            title: placeName,
            address: address,
            category: categoryType,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);

        // Create an onclick event to open the large infowindow at each marker.
        marker.addListener('click', function () {
            setMarkerAnimation(marker);
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
    ko.applyBindings(new ViewModel(placeModel)); // This makes Knockout get to work
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
        infowindow.setContent('<div>' + '<b>' + marker.title + '</b>' + '<p>Address: ' + marker.address + '<br>Category Type: ' + marker.category + '</p>' + '<p></p>Data retrieved from Foursquare</p>' + '</div>');
        // Open the infowindow on the correct marker.
        infowindow.open(map, marker);
    }
}
