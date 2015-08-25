var model = require('./../modules/model');
var moment = require('moment');
var format = require('string-format');

model.getAllSortedEvents(true, function( err, events ) {
    var plusWeek = moment().add(8, 'd'),
        todayStr = moment().format('DD.MM');

    events = events.filter( function(event) {
        var day = moment( event.date, 'DD.MM' );
        return day.isBefore( plusWeek );
    } );

    var html = '<ul>';
    events.forEach(function( e ) {
        var red = ( todayStr === e.date ? ' style="color:red"' : '' ),
            bold = ' style="font-weight:bold"';
        html += format(
            '<li{0}><span>{1} {2}</span>&nbsp;<span{3}>{4}</span>&nbsp;<span{5}>{6}</span></li>',
            red,
            e.date, e.dayOfWeek,
            e.isPerson ? '' : bold, e.event,
            e.isPerson ? bold : '', e.host
        );
    });
    html += '</ul>';

    var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    sendgrid.send({
        to: 'goloniko@gmail.com',
        from: 'contacts2@golonikum.net',
        subject: '[CONTACTS2] Ближайшие события',
        html: html
    }, function(err, json) {
        if (err) { return console.error(err); }
    });
});