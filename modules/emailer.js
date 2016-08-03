var postgres = require('./postgres');
var emailer = require('./emailer');
var moment = require('moment');

function sendEmail( cfg, cb ) {
	var sendgrid  = require('sendgrid')(process.env.SENDGRID_API_KEY);

	sendgrid.send({
		to: 'goloniko@gmail.com',
		from: 'contacts2@golonikum.net',
		subject: cfg.subject || '🎂 Ближайшие события',
		html: cfg.html || 'Авторассылка',
		files: cfg.files || undefined
	}, function(err) {
		if (err) {
			return console.log( err );
		} else {
			cb && cb();
			return console.log('Email was successfully sent.');
		}
	});
}

module.exports = {
	send: sendEmail,

	sendBackupPersons: function( cfg, cb ) {
		postgres.getPersonsJson(function(err, persons) {
			if (!err) {
				sendEmail({
					html: cfg.html || undefined,
					subject: '🎂 Backup',
					files: [{filename: 'persons.' + moment().format('YYYY-MM-DD-HHmmss') + '.json', content: JSON.stringify(persons)}]
				}, cb);
			}
		});
	}
};