import { rm } from "node:fs/promises"

import { DB_FILE_PATH, MGRE_CONFIG_FILE_PATH } from "#constant"

class RmCommand {
    async removeConfigFile() {
        await rm(MGRE_CONFIG_FILE_PATH, { force: true })
    }

    async removeDatabaseFile() {
        await rm(DB_FILE_PATH, { force: true })
    }

    async run() {
        await Promise.all([this.removeConfigFile(), this.removeDatabaseFile()])
    }
}

export const rmCommand = new RmCommand()
