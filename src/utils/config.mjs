import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs"
import { homedir } from "node:os"
import { join } from "node:path"

import logger from "#logger"

class Config {
    static defaultConfig = {
        root: join(homedir(), ".mgre"),
        filename: "config.json",
    }

    static instance

    static getUserConfig() {
        let userConfig
        const configPath = join(
            Config.defaultConfig.root,
            Config.defaultConfig.filename
        )

        if (!existsSync(configPath)) {
            userConfig = {}

            if (!existsSync(Config.defaultConfig.root)) {
                logger.info("Creating root directory")
                mkdirSync(Config.defaultConfig.root)
            }

            logger.info("Creating config file")
            writeFileSync(configPath, JSON.stringify(userConfig))
        } else {
            userConfig = JSON.parse(readFileSync(configPath, "utf-8"))
        }

        return userConfig
    }

    constructor(userConfig) {
        this.config = { ...Config.defaultConfig, ...userConfig }
    }

    static getInstance() {
        if (!Config.instance) {
            Config.instance = new Config(Config.getUserConfig())
        }

        return Config.instance
    }

    get(key) {
        return this.config[key]
    }
}

const config = Config.getInstance()

export default config
