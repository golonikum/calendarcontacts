var pg = require('pg');
var connectionString = process.env.PRODUCTION
    ? 'postgres://pdspldcntxttnp:dMcgXepP3ToNhf7K-AuwvA_Md-@ec2-50-19-233-111.compute-1.amazonaws.com:5432/de9sjuieikqj6k'
    : 'postgres://postgres:12qw34er56ty@localhost:5432/postgres';

function createClient() {
    return new pg.Client(connectionString);
}

function createTableIf(cb) {
    var client = createClient();
    client.connect(function(err) {
        if (err) {
            cb(err);
        }
        client.query('SELECT * FROM files', function(err, result) {
            if (err) {
                client.query('CREATE TABLE files(id SERIAL PRIMARY KEY, body VARCHAR(10000000))', function(err, result) {
                    if (err) {
                        client.end();
                        cb(err);
                    } else {
                        client.query('INSERT INTO files(body) VALUES($1)', ['{}'], function(err, result) {
                            if (err) {
                                client.end();
                                cb(err);
                            } else {
                                cb();
                            }
                        });
                    }
                });
            } else {
                client.end();
                cb();
            }
        });
    });
}

function select( sql, pars, cb ) {
    var client = createClient();
    var fn = function(err, result) {
        if (err) {
            cb(err);
        } else {
            client.end();
            cb(null, result);
        }
    };
    client.connect(function(err) {
        if (err) {
            cb(err);
        }
        client.query(sql, pars ? pars : fn, pars ? fn : undefined);
    });
}

function wrap( cb ) {
    createTableIf(function(err){
        if (err) {
            cb(err);
        } else {
            cb();
        }
    });
}

module.exports = {
    getPersonsJson: function( cb ) {
        wrap(function(err) {
            select( 'SELECT * FROM files', null, function(err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb(null, JSON.parse(result.rows[0].body));
                }
            } );
        });
    },
    setPersons: function( strPersons, cb ) {
        wrap(function(err){
            select( 'UPDATE files SET body = ($1)', [strPersons], function(err, result) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            } );
        });
    }
};