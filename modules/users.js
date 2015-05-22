var fs = require('fs');
var beautify = require('js-beautify').js_beautify;
var hash = require('./pass').hash;

var usersFile = './data/users.json',
    usersData = fs.readFileSync(usersFile, {encoding: 'utf8'}),
    users = JSON.parse( usersData),
    needWrite = false;

for (var login in users) {
    if ( users.hasOwnProperty(login) ) {
        // when you create a user, generate a salt and hash the password
        if ( users[login].password ) {
            needWrite = true;
            (function(user) {
                hash(user.password, function(err, salt, hash){
                    if (err) throw err;
                    // store the salt & hash in the "db"
                    user.salt = salt;
                    user.hash = hash;
                    delete user.password;
                    writeUsers();
                });
            })(users[login]);
        }
    }
}

function writeUsers() {
    fs.writeFileSync( usersFile, beautify(JSON.stringify(users), {indent_size: 4}) );
}

module.exports = {
    get: function(login) {
        return users[ login ];
    }
};