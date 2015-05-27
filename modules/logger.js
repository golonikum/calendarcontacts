var winston = require('winston');
var expressWinston = require('express-winston');

// Set up logger
var customColors = {
    trace: 'white',
    debug: 'green',
    info: 'green',
    warn: 'yellow',
    crit: 'red',
    fatal: 'red'
};
 
var logger = new(winston.Logger)({
    colors: customColors,
        levels: {
            trace: 0,
            debug: 1,
            info: 2,
            warn: 3,
            crit: 4,
            fatal: 5
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
 
logger.log = function (level, msg) {
    if (msg instanceof Error) {
        var args = Array.prototype.slice.call(arguments);
        args[1] = msg.stack;
        origLog.apply(logger, args);
    } else {
        origLog.apply(logger, arguments);
    }
};

/* LOGGER EXAMPLES
    logger.trace('testing');
*/
 
module.exports = {
    logger: logger,
    requestLogger: expressWinston.logger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true
            })
        ]
    }),
    errorLogger: expressWinston.errorLogger({
        transports: [
            new winston.transports.Console({
                json: true,
                colorize: true
            })
        ]
    })
};
