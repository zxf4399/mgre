import { createLogger, format, transports } from "winston"

import Env from "#env"

const env = Env.getInstance()

const logger = createLogger({
    format: format.combine(format.colorize(), format.simple()),
    level: env.isDev ? "debug" : "info",
    transports: [new transports.Console()],
})

export default logger
