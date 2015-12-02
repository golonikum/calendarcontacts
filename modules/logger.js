var winston = require('winston');
var expressWinston = require('express-winston');

// Set up logger
var customColors = {
    trace: 'white',
    debug: 'green',
    info: 'green',
    warn: 'yellow',
    fatal: 'red'
};
 
var logger = new(winston.Logger)({
    colors: customColors,
    levels: {
        trace: 0,
        debug: 1,
        info: 2,
        warn: 3,
        fatal: 4
    },
    transports: [
        new(winston.transports.Console)({
            level: process.env.PRODUCTION ? 'fatal' : 'trace',
            colorize: true,
            timestamp: true
        })
        // new (winston.transports.File)({ filename: 'somefile.log' })
    ]
});
 
winston.addColors(customColors);

// Extend logger object to properly log 'Error' types
var origLog = logger.log;
 
logger.log = function ( level, msg ) {
    if ( msg instanceof Error ) {
        var args = Array.prototype.slice.call(arguments);
        args[1] = msg.stack;
        origLog.apply(logger, args);
    } else {
        origLog.apply(logger, arguments);
    }
};

logger.displayError = function( err, res ) {
    res.status( 500 ).send( 'HTTP 500 Error. See logs.' ).end();
    logger.fatal( err );
};

module.exports = {
    commonLogger: logger,
    requestLogger: expressWinston.logger({
        transports: [
            new winston.transports.Console({
                json: false,
                colorize: true,
                timestamp: true
            })
        ]
    }),
    errorWrapper: function (res, cb) {
        return function(err, arg) {
            try {
                cb.call(this, arg);
            }
            catch ( err ) {
                logger.displayError( err, res );
            }
        };
    },
    errorLogger: function(err, req, res, next) {
        if( !err ) return next();
        logger.displayError( err, res );
    }
};
