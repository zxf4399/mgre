import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

import logger from "#logger"

class Config {
    defaultConfig = {
        filename: "config.json",
        root: join(homedir(), ".mgre"),
    }

    getUserConfig() {
        let userConfig
        const configPath = join(
            this.defaultConfig.root,
            this.defaultConfig.filename
        )

        if (!existsSync(configPath)) {
            userConfig = {}

            if (!existsSync(this.defaultConfig.root)) {
                logger.info("Creating root directory")
                mkdirSync(this.defaultConfig.root)
            }

            logger.info("Creating config file")
            writeFileSync(configPath, JSON.stringify(userConfig))
        } else {
            userConfig = JSON.parse(readFileSync(configPath, "utf-8"))
        }

        return userConfig
    }

    constructor() {
        this.config = { ...this.defaultConfig, ...this.getUserConfig() }
    }

    get(key) {
        return this.config[key]
    }
}

export default new Config()
