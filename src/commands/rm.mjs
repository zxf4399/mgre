import { rm } from "node:fs/promises"

import { CONFIG_FILE_PATH, DB_FILE_PATH } from "#constant"

/**
 *
 * Removes configuration file and database file.
 * @class
 */
class RmCommand {
    /**
     * Removes configuration file
     *
     * @async
     * @returns {Promise<void>} - A promise that resolves when the configuration file has been removed.
     */
    async removeConfigFile() {
        await rm(CONFIG_FILE_PATH, { force: true })
    }

    /**
     * Removes database file
     *
     * @async
     * @returns {Promise<void>} - A promise that resolves when the database file has been removed.
     */
    async removeDatabaseFile() {
        await rm(DB_FILE_PATH, { force: true })
    }

    /**
     * Removes configuration file and database file
     *
     * @async
     * @returns {Promise<void>} - A promise that resolves when the configuration file and database file have been removed.
     */
    async run() {
        await Promise.all([this.removeConfigFile(), this.removeDatabaseFile()])
    }
}

export const rmCommand = new RmCommand()
