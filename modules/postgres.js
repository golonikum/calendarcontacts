var pg = require('pg');
var connectionString = "postgres://pdspldcntxttnp:dMcgXepP3ToNhf7K-AuwvA_Md-@ec2-50-19-233-111.compute-1.amazonaws.com:5432/de9sjuieikqj6k";

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
                        client.query('INSERT INTO files(body) VALUES("{}")', function(err, result) {
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

function select(sql, cb) {
    var client = createClient();
    client.connect(function(err) {
        if (err) {
            cb(err);
        }
        client.query(sql, function(err, result) {
            if (err) {
                cb(err);
            } else {
                client.end();
                cb(null, result);
            }
        });
    });
}



module.exports = {
    getPersonsJson: function( cb ) {
        createTableIf(function(err){
            if (err) {
                cb(err);
            } else {
                select( 'SELECT * FROM files', function(err, result) {
                    if (err) {
                        cb(err);
                    } else {
                        cb(null, JSON.parse(result.rows[0].body));
                    }
                } );
            }
        });
    }
};