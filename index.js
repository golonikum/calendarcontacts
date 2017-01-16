var express = require('express');
var path = require('path');
var multer = require('multer');
var bodyParser = require('body-parser');
var auth = require('./modules/auth');
var routes = require('./modules/routes');
var logger = require('./modules/logger');
var app = express();
var port = Number(process.env.PORT || 3001);
var lessMiddleware = require('less-middleware');

// config templates and static files
app.set('view engine', 'jade');
app.set('views', path.join(__dirname, 'templates'));
app.use(lessMiddleware( path.join(__dirname, 'public') ));
app.use(express.static( path.join(__dirname, 'public') ));

// some middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({dest: './uploads/'}));

// express-winston logger makes sense BEFORE the router
app.use(logger.requestLogger);

// auth
auth.init( app );

// routes
routes.init( app );

// express-winston errorLogger makes sense AFTER the router
app.use(logger.errorLogger);

// run
app.listen(port, function() {
    console.log('Express started on ' + port);
});
