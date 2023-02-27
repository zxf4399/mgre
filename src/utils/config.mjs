import { existsSync, readFileSync } from "node:fs"
import { writeFile } from "node:fs/promises"

import { mergeWith } from "lodash-es"

import { CONFIG_PATH } from "#constant"

/**
 * The Config class provides methods for accessing and modifying the application's configuration file.
 */
export class Config {
    /**
     * Returns the entire configuration object.
     *
     * @returns {Object} - The entire configuration object.
     */
    getUserConfig() {
        let userConfig = {}

        if (existsSync(CONFIG_PATH)) {
            userConfig = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"))
        }

        return userConfig
    }

    /**
     * Constructs a new Config object and initializes the configuration data from the file system.
     */
    constructor() {
        this.config = this.getUserConfig()
    }

    /**
     * Returns the value of the specified key in the configuration object.
     *
     * @param {string} key - The key to retrieve from the configuration object.
     * @returns {*} - The value of the specified key in the configuration object, or undefined if the key does not exist.
     */
    get(key) {
        return this.config[key]
    }

    /**
     * Updates the configuration file with the specified data.
     *
     * @async
     * @param {Object} data - The data to merge into the existing configuration.
     * @returns {Promise<void>}
     */
    async update(data) {
        await writeFile(
            CONFIG_PATH,
            JSON.stringify(
                // eslint-disable-next-line consistent-return
                mergeWith(this.config, data, (objValue, srcValue) => {
                    if (Array.isArray(objValue)) {
                        return objValue.concat(srcValue)
                    }
                }),
                null,
                2
            )
        )
    }
}

export default new Config()
