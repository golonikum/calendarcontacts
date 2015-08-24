var model = require('./../modules/model');
var moment = require('moment');

model.getAllSortedEvents(true, function( err, events ) {
    var plusWeek = moment().add(8, 'd');

    events = events.filter( function(event) {
        var day = moment( event.date, 'DD.MM' );
        return day.isBefore( plusWeek );
    } );

    var text = '';
    events.forEach(function( e ) {
        text += e.date + ' ' + e.dayOfWeek + ' ' + e.event + ' ' + e.host + '\r\n';
    });

    var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    sendgrid.send({
        to:       'goloniko@gmail.com',
        from:     'contacts2@golonikum.net',
        subject:  '[CONTACTS]',
        text:     text
    }, function(err, json) {
        if (err) { return console.error(err); }
    });
});