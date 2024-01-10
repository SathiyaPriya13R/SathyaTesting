const { createLogger, transports, format } = require('winston');

/**
 * Format the log messages with timestamp
 */
const customFormat = format.combine(format.timestamp(), format.printf((info: any) => {
    return `${info.timestamp} - [${info.level.toUpperCase().padEnd(5)}] - ${info.message}`
}));

/**
 * Controll log message
 */
const logger = createLogger({
    format: customFormat,
    transports: [
        new transports.Console({
            level: 'info'
        }),
        new transports.File({
            filename: 'combained.log',
            level: 'info'
        })
    ]
});

module.exports = logger;