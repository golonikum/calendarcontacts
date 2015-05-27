var moment = require('moment');
var beautify = require('js-beautify').js_beautify;
var auth = require('./auth');
var model = require('./model');
var logger = require('./logger').logger;

function errorWrapper(res, cb) {
    return function(err, arg) {
        if ( err ) {
            logger.fatal(err);
            res.status(500).end();
        } else {
            cb.call(this, arg);
        }
    };
}

module.exports = {
    init: function(app) {
        app.get('/', function(req, res){
            res.redirect('/main');
        });

        app.get('/main', auth.restrict, function(req, res){
            res.render('main', {title: 'Главная'});
        });

        app.get('/nearest', auth.restrict, function(req, res) {
            model.getAllSortedEvents(true, errorWrapper(res, function(events) {
                res.render('events', {title: 'Ближайшие события: ' + moment().format('DD.MM.YYYY'), events: events});
            }));
        });

        app.get('/all', auth.restrict, function(req, res){
            model.getAllSortedEvents(false, errorWrapper(res, function(events) {
                res.render('events', {title: 'Все события', events: events});
            }));
        });

        app.get('/load', auth.restrict, function(req, res){
            res.render('load', {title: 'Загрузка данных'});
        });

        app.post('/load', auth.restrict, function(req, res){
            model.uploadPesronsFile(req.files.persons.path, errorWrapper(res, function() {
                res.redirect('/main');
            }));
        });

        app.get('/search', auth.restrict, function(req, res){
            res.render('search', {title: 'Информация о людях', fio: ''});
        });

        app.post('/search', auth.restrict, function(req, res){
            model.findPersons(req.body.fio, errorWrapper(res, function(persons) {
                res.render('search', {title: 'Информация о людях (найдено ' + persons.length + ')', persons: persons, fio: req.body.fio});
            }));
        });

        app.get('/person', auth.restrict, function(req, res){
            var id = req.query.id;
            if ( id ) {
                model.getPerson(id, errorWrapper(res, function(person){
                    var obj = {
                            title: 'Информация о человеке'
                        };
                    if (person) {
                        obj.person = person;
                        obj.id = id;
                    } else {
                        obj.error = 'Ошибка';
                    }
                    res.render('person', obj);
                }));
            } else {
                res.render('person', {title: 'Добавить информацию'});
            }
        });

        app.post('/person', auth.restrict, function(req, res){
            var id = req.query.id;
            if ( !id ) {
                id = Date.now();
            }
            model.updatePerson(id, req.body, errorWrapper(res, function(){
                res.redirect('/person?id=' + id);
            }));
        });

        app.get('/remove-person', auth.restrict, function(req, res){
            var id = req.query.id;
            if ( id ) {
                model.removePerson(id, errorWrapper(res, function(){
                    res.redirect('/main');
                }));
            }
        });

        app.get('/download', auth.restrict, function(req, res){
            model.getAllPersons(errorWrapper(res, function(persons){
                res.setHeader('Content-disposition', 'attachment; filename=persons.' + moment().format('YYYY-MM-DD-HHmmss') + '.json');
                res.setHeader('Content-type', 'application/json');
                res.end( beautify(JSON.stringify(persons)) );
            }));
        });
    }
};



