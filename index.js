var express = require('express');
var path = require('path');
var multer = require('multer');
var bodyParser = require('body-parser');
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

// auth
auth.init( app );

// routes
routes.init( app );

//error handling
/*app.use(function(err, req, res, next) {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});*/

// run
app.listen(port, function() {
    console.log('Express started on ' + port);
});
