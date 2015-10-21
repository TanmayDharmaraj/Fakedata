var cluster = require('cluster');
var winston = require('winston');
winston.emitErrs = true;

if (cluster.isMaster) {
    cluster.setupMaster({ silent: true }); // Keep cluster from automatically grabbing stdin/out/err
    var cpuCount = require('os').cpus().length;    
    var logger = new winston.Logger({
        transports: [
            new (winston.transports.File)({
                name: 'all-logs',
                level: 'info',
                filename: './logs/all-logs.log',
                handleExceptions: false,
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: false
            }),
            new (winston.transports.File)({
                name: 'error-logs',
                level: 'error',
                filename: './logs/error.log',
                handleExceptions: true,
                json: true,
                maxsize: 5242880, //5MB
                maxFiles: 5,
                colorize: false
            }),
            new winston.transports.Console({
                level: 'debug',
                handleExceptions: true,
                json: false,
                colorize: true
            })
        ],
        exitOnError: false
    });

    
    for (var i = 0; i < cpuCount; i++) {
        var worker = cluster.fork();
        worker.process.stdout.on('data', function (chunk) {
            logger.log('info', 'worker ' + i + ': ' + chunk);
        });
        worker.process.stderr.on('data', function (chunk) {
            logger.log('error', 'worker ' + i + ': ' + chunk);
        });
    }
    
    // Listen for dying workers
    cluster.on('exit', function () {
        var worker = cluster.fork();
        worker.process.stdout.on('data', function (chunk) {
            logger.log('info', 'worker ' + i + ': ' + chunk);
        });
        worker.process.stderr.on('data', function (chunk) {
            logger.log('error', 'worker ' + i + ': ' + chunk);
        });
    });
} else {
    //all workers only log to stdout/err
    require('./app');
}