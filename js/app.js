const placeModel = [
    { title: 'Clifton Sea View', location: { lat: 24.789667, lng: 67.04386}},
    { title: 'Mazaar–e–Quaid', location: { lat: 24.874553, lng: 67.039813 }},
    { title: 'Mohatta Palace', location: { lat: 24.814236, lng: 67.032993 } },
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
