var model = require('./../modules/model');
var moment = require('moment');

model.getAllSortedEvents(true, function( err, events ) {
    var plusWeek = moment().add(8, 'd'),
        todayStr = moment().format('DD.MM');

    events = events.filter( function(event) {
        var day = moment( event.date, 'DD.MM' );
        return day.isBefore( plusWeek );
    } );

    var text = '',
        html = '<ul>';
    events.forEach(function( e ) {
        var red = ( todayStr === e.date ? ' style="color:red"' : '' );
        text += e.date + ' ' + e.dayOfWeek + ' ' + e.event + ' ' + e.host + '\r\n';
        html += '<li' + red + '><span style="font-family: \"courier new\", monospace;">' + e.date + ' ' + e.dayOfWeek + '</span>&nbsp;<b>' + e.event + '</b>&nbsp;<span>' + e.host + '</span></li>';
    });
    html += '</ul>';

    var sendgrid  = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    sendgrid.send({
        to: 'goloniko@gmail.com',
        from: 'contacts2@golonikum.net',
        subject: '[CONTACTS2]',
        text: text,
        html: html
    }, function(err, json) {
        if (err) { return console.error(err); }
    });
});