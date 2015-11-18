var model = require('./../modules/model');
var moment = require('moment');
var format = require('string-format');
var logger = require('./../modules/logger').logger;

model.getAllSortedEvents(true, function( err, events ) {
    var plusWeek = moment().add(7, 'd'),
        todayStr = moment().format('DD.MM'),
        tomorrowStr = moment().add(1, 'd').format('DD.MM');

    events = events.filter( function(event) {
        var year = '.' + ( event.year || moment().format('YYYY') ),
            day = moment( event.date + year, 'DD.MM.YYYY' );
        return day.isBefore( plusWeek );
    } );

    var html = '<ul style="font-size:16px;">';
    events.forEach(function( e ) {
        var color = ( e.date === todayStr ? 'color:red;' : ( e.date === tomorrowStr ? 'color:#ef7808;' : '' ) ),
            bold = ' style="font-weight:bold"';
        html += format(
            '<li style="line-height:30px;{0}"><span>{1} {2}</span>&nbsp;<span{3}>{4}</span>&nbsp;<span{5}>{6}</span></li>',
            color,
            e.date, e.dayOfWeek,
            e.isPerson ? '' : bold, e.event,
            e.isPerson ? bold : '', e.host
        );
    });
    html += '</ul>';

    var sendgrid  = require('sendgrid')(process.env.SENDGRID_API_KEY);
    sendgrid.send({
        to: 'goloniko@gmail.com',
        from: 'contacts2@golonikum.net',
        subject: '🎂 Ближайшие события',
        html: html
    }, function(err, json) {
        if (err) { return console.log(err); }
        else { return console.log('Email was successfully send.'); }
    });
});