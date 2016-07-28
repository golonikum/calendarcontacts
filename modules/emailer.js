module.exports = {
	send: function( cfg, cb ) {
		var sendgrid  = require('sendgrid')(process.env.SENDGRID_API_KEY);

		sendgrid.send({
			to: 'goloniko@gmail.com',
			from: 'contacts2@golonikum.net',
			subject: cfg.subject || '🎂 Ближайшие события',
			html: cfg.html,
			files: cfg.files || undefined
		}, function(err, json) {
			if (err) {
				return console.log( err );
			} else {
				cb && cb();
				return console.log('Email was successfully sent.');
			}
		});

	}
};