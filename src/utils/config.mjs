import { existsSync, readFileSync, writeFileSync } from "node:fs"

import { MGRE_CONFIG_FILE_PATH } from "#constant"

class Config {
    constructor(configFilePath) {
        this.configFilePath = configFilePath

        this.map = new Map()

        this.loadConfig()
    }

    loadConfig() {
        let configData = {}

        if (existsSync(this.configFilePath)) {
            configData = JSON.parse(readFileSync(this.configFilePath, "utf-8"))
        }

        for (const [key, value] of Object.entries(configData)) {
            this.map.set(key, value)
        }
    }

    saveConfig() {
        writeFileSync(
            this.configFilePath,
            JSON.stringify(Object.fromEntries(this.map.entries()), null, 2)
        )
    }

    get(key) {
        return this.map.get(key)
    }

    set(key, value) {
        this.map.set(key, value)

        this.saveConfig()
    }

    delete(key) {
        this.map.delete(key)

        this.saveConfig()
    }

    has(key) {
        return this.map.has(key)
    }
}

export const mgreConfig = new Config(MGRE_CONFIG_FILE_PATH)
