var moment = require('moment');
var fs = require('fs');
var path = require('path');
var mime = require('mime');
var auth = require('./auth');
var model = require('./model');

module.exports = {
    init: function(app) {
        app.get('/', function(req, res){
            res.redirect('/main');
        });

        app.get('/main', auth.restrict, function(req, res){
            res.render('main', {title: 'Главная'});
        });

        app.get('/nearest', auth.restrict, function(req, res){
            res.render('events', {title: 'Ближайшие события: ' + moment().format('DD.MM.YYYY'), events: model.getAllSortedEvents(true)});
        });

        app.get('/all', auth.restrict, function(req, res){
            res.render('events', {title: 'Все события', events: model.getAllSortedEvents()});
        });

        app.get('/load', auth.restrict, function(req, res){
            res.render('load', {title: 'Загрузка данных'});
        });

        app.post('/load', auth.restrict, function(req, res){
            var filePath = path.normalize(__dirname + '/../data/persons.json'),
                uploadPath = path.normalize(__dirname + '/../' + req.files.persons.path);
            // backup file
            if ( fs.existsSync(filePath) ) {
                fs.renameSync(filePath, filePath + moment().format('.YYYYMMDDHHmmss') + '.bak');
            }
            // write file
            fs.readFile(uploadPath, function (err, data) {
                fs.writeFile(filePath, data, function (err) {
                    res.redirect('/main');
                });
            });
        });

        app.get('/search', auth.restrict, function(req, res){
            res.render('search', {title: 'Информация о людях'});
        });

        app.post('/search', auth.restrict, function(req, res){
            var persons = model.findPersons(req.body.fio);
            res.render('search', {title: 'Информация о людях (' + persons.length + ')', persons: persons});
        });

        app.get('/person', auth.restrict, function(req, res){
            var id = req.query.id;
            if ( id ) {
                var person = model.getPerson(id),
                    obj = {
                        title: 'Информация о человеке'
                    };
                if (person) {
                    obj.person = person;
                    obj.id = id;
                } else {
                    obj.error = 'Ошибка';
                }
                res.render('person', obj);
            } else {
                res.render('person', {title: 'Добавить информацию'});
            }
        });

        app.post('/person', auth.restrict, function(req, res){
            var id = req.query.id;
            if ( !id ) {
                id = Date.now();
            }
            model.updatePerson(id, req.body);
            res.redirect('/person?id=' + id);
        });

        app.get('/remove-person', auth.restrict, function(req, res){
            var id = req.query.id;
            if ( id ) {
                model.removePerson(id);
            }
            res.redirect('/main');
        });

        app.get('/download', auth.restrict, function(req, res){
            var file = __dirname + '/../data/persons.json',
                filename = path.basename(file),
                mimetype = mime.lookup(file);

            res.setHeader('Content-disposition', 'attachment; filename=' + filename);
            res.setHeader('Content-type', mimetype);

            fs.createReadStream(file).pipe(res);
        });
    }
};



