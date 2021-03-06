var session = require('express-session');
var hash = require('./pass').hash;
var users = require('./users');

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);
    var user = users.get(name);
    // query the db for the given username
    if (!user) return fn(new Error('cannot find user'));
    // apply the same algorithm to the POSTed password, applying
    // the hash against the pass / salt, if there is a match we
    // found the user
    hash(pass, user.salt, function(err, hash){
        if (err) return fn(err);
        if (hash == user.hash) return fn(null, user);
        fn(new Error('invalid password'));
    });
}

function restrict(req, res, next) {
    if (req.session.user) {
        next();
    } else {
        req.session.error = 'Access denied!';
        res.redirect('/login');
    }
}

module.exports = {
    init: function(app) {
        // middleware
        app.use(session({
            resave: false, // don't save session if unmodified
            saveUninitialized: false, // don't create session until something stored
            secret: 'shhhh, very secret'
        }));

        // Session-persisted message middleware
        app.use(function(req, res, next){
            var err = req.session.error;
            delete req.session.error;
            res.locals.message = '';
            if (err) res.locals.message = err;
            next();
        });

        app.get('/logout', function(req, res){
            // destroy the user's session to log them out
            // will be re-created next request
            req.session.destroy(function(){
                res.redirect('/login');
            });
        });

        app.get('/login', function(req, res){
            if (req.session.user) {
                res.redirect('/main');
            } else {
                res.render('login', {title: 'Авторизация'});
            }
        });

        app.post('/login', function(req, res){
            authenticate(req.body.username, req.body.password, function(err, user){
                if (user) {
                    // Regenerate session when signing in
                    // to prevent fixation
                    req.session.regenerate(function(){
                        // Store the user's primary key
                        // in the session store to be retrieved,
                        // or in this case the entire user object
                        req.session.user = user;
                        res.redirect('/main');
                    });
                } else {
                    req.session.error = 'Authentication failed, please check your username and password.';
                    res.redirect('/login');
                }
            });
        });
    },

    restrict: restrict
};