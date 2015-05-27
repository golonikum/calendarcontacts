var express = require('express');
var path = require('path');
var multer = require('multer');
var bodyParser = require('body-parser');
var winston = require('winston');
var expressWinston = require('express-winston');
var auth = require('./modules/auth');
var routes = require('./modules/routes');
var app = express();
var port = Number(process.env.PORT || 3001);

// config templates and static files
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'templates'));
app.use( express.static( path.join(__dirname, 'public') ) );

// some middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest: './uploads/'}));

// express-winston logger makes sense BEFORE the router
app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
}));

// auth
auth.init( app );

// routes
routes.init( app );

// express-winston errorLogger makes sense AFTER the router
app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: true,
            colorize: true
        })
    ]
}));

// run
app.listen(port, function() {
    console.log('Express started on ' + port);
});
