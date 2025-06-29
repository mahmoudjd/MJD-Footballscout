import winston from "winston";

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.colorize(),  // <<< Farben aktivieren
        winston.format.timestamp(),
        winston.format.printf(({level, message, timestamp}) => {
            return `${timestamp} [${level}]: ${message}`;  // level ist hier schon gefärbt
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({filename: "logs/logs.log"})
    ],
});

export default logger;
