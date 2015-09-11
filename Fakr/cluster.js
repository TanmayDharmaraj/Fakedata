var cluster = require('cluster');
var winston = require('winston');
winston.emitErrs = true;

if (cluster.isMaster) {
    cluster.setupMaster({ silent: true }); // Keep cluster from automatically grabbing stdin/out/err
    var cpuCount = require('os').cpus().length;
    winston.add(winston.transports.File, {
        level: 'info',
        filename: './logs/all-logs.log',
        handleexceptions: true,
        json: true,
        maxsize: 5242880, //5mb
        maxfiles: 5,
        colorize: false
    });
    
    for (var i = 0; i < cpuCount; i++) {
        worker = cluster.fork();
        worker.process.stdout.on('data', function (chunk) {
            winston.info('worker ' + i + ': ' + chunk);
        });
        worker.process.stderr.on('data', function (chunk) {
            winston.debug('worker ' + i + ': ' + chunk);
        });
    }
    
    // Listen for dying workers
    cluster.on('exit', function () {
        var worker = cluster.fork();
        worker.process.stdout.on('data', function (chunk) {
            winston.info('worker ' + i + ': ' + chunk);
        });
        worker.process.stderr.on('data', function (chunk) {
            winston.warn('worker ' + i + ': ' + chunk);
        });
    });
} else {
    //all workers only log to stdout/err
    require('./app');
}