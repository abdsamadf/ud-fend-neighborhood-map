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

    placeModel.forEach((item) => {
        this.placeList.push(new Place(item));
    })
    // console.log(this.listItem)

};

ko.applyBindings(new ViewModel()); // This makes Knockout get to work
