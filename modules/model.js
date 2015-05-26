var fs = require('fs');
var moment = require('moment');
var mime = require('mime');
var path = require('path');
var postgres = require('./postgres');
var beautify = require('js-beautify').js_beautify;
var S = require('string');

var eventsFile = './data/events.json',
    personsFile = './data/persons.json',
    events = null,
    persons = null;


/**
 * Use environment var PRODUCTION.
 * For Heroku it is set to '1', and use PostgresQL for serving persons file.
 * For development we use filesystem.
 */




function getPersonsObj( cb ) {
    if ( process.env.PRODUCTION ) {
        postgres.getPersonsJson(cb);
    } else {
        cb( null, readJson(personsFile) );
    }
}

function setPersonsObj() {
    if (process.env.PRODUCTION) {

    } else {
        writeJson(persons, personsFile);
    }
}

function readJson( file ) {
    return JSON.parse( fs.readFileSync(file, {encoding: 'utf8'}) );
}

function writeJson( obj, file ) {
    fs.writeFileSync(file, beautify( JSON.stringify(obj) ), {encoding: 'utf8'});
}

function getComparableDate( event ) {
    var date = event.date;
    return date.substr(3, 2) + date.substr(0, 2);
}

function getAge( date ) {
    if (date.length < 10) {
        return '';
    } else {
        var curYear = (new Date()).getFullYear(),
            year = date.substr(6, 4),
            age = curYear - year;
        if ( age === 0 ) {
            return '';
        } else {
            return ' (' + age + ' ' + getRussianAge(age) + ')';
        }
    }
}

function getCounterRussian( number, words ) {
    var numAsStr = number.toString(),
        len = numAsStr.length,
        last = numAsStr[len - 1],
        lastButOne = ( len > 1 ? numAsStr[len - 2] : 0 );
    if ( lastButOne == '1' ) {
        return words[2];
    } else {
        if ( last == '1' )
            return words[0];
        else if ( last > 1 && last < 5 )
            return words[1];
        else
            return words[2];
    }
}

function getRussianAge( age ) {
    return getCounterRussian( age, ['год', 'года', 'лет'] );
}

function getFullName( fio ) {
    if ( fio['сан'] ) {
        return fio['сан'] + ' ' +  fio['имя'] + ' (' + fio['фамилия'] + ')';
    } else {
        return fio['фамилия'] + ' ' +  fio['имя'] + (fio['отчество'] ? ' ' + fio['отчество'] : '');
    }
}

function isToday( strDate ) {
    var today = moment().format( 'DD.MM' );
    return ( strDate.substr(0, 5) === today );
}

function isMiddlename( str ) {
    var s = S(str);
    return ( s.endsWith('ич') || s.endsWith('вна')  || s.endsWith('ична') );
}

function convertPerson( body ) {
    var person = {
        "фио": {},
        "события": {},
        "контакты": {}
    };

    body.group && ( person["группа"] = body.group );
    body.lastname && ( person["фио"]["фамилия"] = body.lastname );
    body.firstname && ( person["фио"]["имя"] = body.firstname );
    body.middlename && ( person["фио"][isMiddlename(body.middlename) ? "отчество" : "сан"] = body.middlename );
    body.address && ( person["адрес"] = body.address );

    var i = 0;
    while(body['eventname' + i]) {
        person["события"][body['eventname' + i]] = body['eventvalue' + i];
        i++;
    };

    body.phones && ( person["контакты"]["телефоны"] = body.phones.split(',') );
    body.emails && ( person["контакты"]["e-mails"] = body.emails.split(',') );

    return person;
}



module.exports = {
    getAllSortedEvents: function( nearest, cb ) {
        events = readJson( eventsFile );
        getPersonsObj(function(err, persons) {
            if (err) {
                cb(err);
            } else {
                var all = [];

                for (var host in events) {
                    for (var event in events[host]) {
                        var date = events[host][event],
                            curYear = (new Date()).getFullYear(),
                            year = ( date.substr(6, 4) || curYear ),
                            age = curYear - year;

                        all.push({
                            isPerson: false,
                            date: date,
                            event: event + getAge(date),
                            host: host,
                            today: isToday(date)
                        });
                    }
                }

                for (var id in persons) {
                    var person = persons[id],
                        fio = person['фио'];

                    for (var event in person['события']) {
                        var date = person['события'][event];
                        all.push({
                            id: id,
                            isPerson: true,
                            date: date,
                            event: event + getAge(date),
                            host: getFullName(fio),
                            today: isToday(date)
                        });
                    }
                }

                all.sort(function(a, b){
                    var d1 = getComparableDate(a),
                        d2 = getComparableDate(b);
                    if (d1 > d2) return 1;
                    else if (d1 < d2) return -1;
                    else return 0;
                });

                if (nearest) {
                    var start = moment().format('MMDD');
                    end = moment().add(2, 'M').format('MMDD');

                    all = all.filter(function(event){
                        var date = getComparableDate( event );
                        return ( start <= date && date < end );
                    });
                }

                cb(null, all);
            }
        });

    },

    findPersons: function( searchText ) {
        var found = [];

        persons = getPersonsObj();

        for (var id in persons) {
            var person = persons[id],
                fio = person['фио'],
                fullName = getFullName(fio);

            if ( fullName.indexOf(searchText) != -1 ) {
                found.push({
                    id: id,
                    fullName: fullName
                });
            }
        }

        return found;
    },

    getPerson: function( id ) {
        persons = getPersonsObj();
        return persons[ id ];
    },

    updatePerson: function( id, body ) {
        persons = getPersonsObj();
        persons[ id ] = convertPerson(body);
        setPersonsObj();
    },

    removePerson: function( id ) {
        persons = getPersonsObj();
        delete persons[ id ];
        setPersonsObj();
    },

    sendPersonsFile: function(res) {
        var file = __dirname + '/../data/persons.json',
            filename = path.basename(file),
            mimetype = mime.lookup(file);

        res.setHeader('Content-disposition', 'attachment; filename=' + moment().format('YYYY-MM-DD.') + filename);
        res.setHeader('Content-type', mimetype);

        fs.createReadStream(file).pipe(res);
    },

    uploadPesronsFile: function(file, cb) {
        var filePath = path.normalize(__dirname + '/../data/persons.json'),
            uploadPath = path.normalize(__dirname + '/../' + file);
        // backup file
        if ( fs.existsSync(filePath) ) {
            fs.renameSync(filePath, filePath + moment().format('.YYYYMMDDHHmmss') + '.bak');
        }
        // write file
        fs.readFile(uploadPath, function (err, data) {
            fs.writeFile(filePath, data, cb);
        });
    }
};