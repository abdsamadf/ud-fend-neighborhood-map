const placeModel = [
    { title: 'Clifton Sea View', location: { lat: 24.789667, lng: 67.04386}},
    { title: 'Mazaar–e–Quaid', location: { lat: 24.874553, lng: 67.039813 }},
    { title: 'Mohatta Palace', location: { lat: 24.814236, lng: 67.032993 } },
    { title: 'Charna Island', location: { lat: 24.8967716, lng: 66.594808 } },
    { title: 'Barrett Hodgson University', location: { lat: 24.7994988, lng: 67.1091056 } },


]

// place data model
const Place = function(data) {
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.location.lat);
    this.lng = ko.observable(data.location.lng);
}

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
            return self.placeList();
        } else {
            return self.placeList()
                .filter(place => place.title().toLowerCase().indexOf(self.query().toLowerCase()) > -1);
        }
    });
};

ko.applyBindings(new ViewModel()); // This makes Knockout get to work


var map;
// Create a new blank array for all the listing markers.
var markers = [];

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
    //        center: new google.maps.LatLng(25.1921465,    66.5949955),
        // center: { lat: 40.7413549, lng: -73.9980244 },
        center: { lat: placeModel[0].location.lat, lng: placeModel[0].location.lng},
        zoom: 13,
    });

    // The following group uses the location array to create an array of markers on initialize.
    for (var i = 0; i < placeModel.length; i++) {
        // Get the position from the location array.
        var position = placeModel[i].location;
        var title = placeModel[i].title;
        // Create a marker per location, and put into markers array.
        var marker = new google.maps.Marker({
            position: position,
            title: title,
            animation: google.maps.Animation.DROP,
            id: i
        });
        // Push the marker to our array of markers.
        markers.push(marker);
    }

    // This will loop through the markers array and display them all.
    var bounds = new google.maps.LatLngBounds();
    // Extend the boundaries of the map for each marker and display the marker
    for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
}