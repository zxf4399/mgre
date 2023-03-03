import { createLogger, format, transports } from "winston"

const logger = createLogger({
    format: format.combine(format.colorize(), format.simple()),
    transports: [new transports.Console()],
})

export default logger
