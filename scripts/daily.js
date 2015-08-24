var model = require('./../modules/model');
var moment = require('moment');

model.getAllSortedEvents(true, function( err, events ) {
    var tomorrow = moment().add(2, 'd');

    events = events.filter( function(event) {
        var day = moment( event.date, 'DD.MM' );
        return ( day.isBefore( tomorrow ) );
    } );

    events.forEach(function(event) {
        console.log( event.date );
    });
});