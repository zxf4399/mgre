import { access } from "node:fs/promises"
import { join } from "node:path"

import * as p from "@clack/prompts"
import clipboardy from "clipboardy"
import { execa } from "execa"
import GitUrlParse from "git-url-parse"

import config from "#config"
import { CONFIG_FIELDS, CONFIG_PATH, DEFAULT_CONFIG } from "#constant"
import db from "#db"
import logger from "#logger"

class CloneCommand {
    /**
     * Gets the codebase from the configuration file that matches the given resource.
     *
     * @param {string} resource - The codebase resource name.
     * @returns {Object|undefined} - The codebase object if it exists, otherwise undefined.
     */
    getCodebase(resource) {
        return config
            .get(CONFIG_FIELDS.CODEBASES)
            ?.find((codebase) => codebase.url === resource)
    }

    /**
     * Checks whether the given codebase object is valid by ensuring that it has a name and email property.
     *
     * @param {Object} codebase - The codebase object to check.
     * @returns {boolean} - True if the codebase object is valid, otherwise false.
     */
    isValidCodebase(codebase) {
        return !!codebase?.name && !!codebase?.email
    }

    /**
     * Sets the Git user information to the group information in the configuration file that matches the given codebase resource.
     *
     * @async
     * @param {string} resource - The codebase resource name.
     * @param {string} localRepoPath - The local repository path.
     * @returns {Promise<void>}
     */
    async setUserConfig(resource, localRepoPath) {
        const codebase = this.getCodebase(resource)

        if (this.isValidCodebase(codebase)) {
            try {
                await Promise.all([
                    execa(
                        "git",
                        ["config", "--replace-all", "user.name", codebase.name],
                        {
                            cwd: localRepoPath,
                        }
                    ),
                    execa(
                        "git",
                        [
                            "config",
                            "--replace-all",
                            "user.email",
                            codebase.email,
                        ],
                        {
                            cwd: localRepoPath,
                        }
                    ),
                ])

                logger.info(
                    `Successfully set Git user info for ${resource} in the repository.`
                )
            } catch (error) {
                logger.error(error.message)
            }
        }
    }

    /**
     * Prompts the user with a series of prompts to help create or update a configuration file.
     *
     * @async
     * @param {string} resource - The codebase resource name.
     * @param {string} localRepoPath - The local repository path.
     * @returns {Promise<Object|null>} An object containing the user group information, or null if the user chooses to skip configuring Git user info.
     */
    async popupPrompts(resource, localRepoPath) {
        p.intro(
            "This utility guides you through the process of creating or updating a configuration file."
        )

        const skipGitConfig = await p.confirm({
            message:
                "Would you like to skip configuring Git user info? If you choose to skip, the repository will use your global Git user info.",
        })

        if (skipGitConfig) {
            return null
        }

        const group = await p.group(
            {
                name: () =>
                    p.text({
                        message: `What is your Git username for "${resource}"?`,
                    }),
                email: () =>
                    p.text({
                        message: `What is your Git email for "${resource}"?`,
                    }),
            },
            {
                onCancel: () => {
                    p.cancel(
                        `Clone operation cancelled by user. To retry, run 'mgre clone ${localRepoPath}'.`
                    )

                    process.exit(0)
                },
            }
        )

        return group
    }

    /**
     * Checks whether the given codebase resource already exists in the user configuration.
     *
     * @async
     * @param {string} resource - The codebase resource name.
     * @returns {Promise<void>} True if the codebase resource already exists, false otherwise.
     */
    async checkCodebaseExists(resource) {
        try {
            await access(CONFIG_PATH)

            const codebase = this.getCodebase(resource)

            if (this.isValidCodebase(codebase)) {
                return true
            }

            return false
        } catch (error) {
            return false
        }
    }

    /**
     * Adds the given group information to the user configuration file.
     *
     * @param {Object} group - An object containing the group name and email.
     * @param {string} resource - The codebase resource name.
     * @returns {Promise<void>}
     */
    async updateConfigFile(group, resource) {
        if (group === null) return

        await config.update({
            [CONFIG_FIELDS.CODEBASES]: [
                {
                    email: group.email,
                    name: group.name,
                    url: resource,
                },
            ],
        })
    }

    /**
     * Parses the given Git URL and returns the resource and local repository path.
     *
     * @param {string} gitUrl - Git URL, should include the protocol and URL.
     * @returns {[string, string]} - A tuple containing the resource and local repository path.
     */
    parseGitUrl(gitUrl) {
        const parsed = GitUrlParse(gitUrl)

        const { name, owner, resource } = parsed

        const localRepoPath = `${join(
            DEFAULT_CONFIG.root,
            resource,
            owner,
            name
        )}`

        return [resource, localRepoPath]
    }

    /**
     * Clone codebase from the given Git URL
     *
     * @async
     * @param {string} gitUrl - Git URL
     * @returns {Promise<void>}
     */
    async run(gitUrl) {
        const [resource, localRepoPath] = this.parseGitUrl(gitUrl)

        const codebaseExists = await this.checkCodebaseExists(resource)

        if (!codebaseExists) {
            const group = await this.popupPrompts(resource, localRepoPath)

            await this.updateConfigFile(group, resource)
        }

        execa("git", ["clone", gitUrl, localRepoPath, "--progress"])
            .on("close", async (code) => {
                if (code !== 0) {
                    logger.error("Repository cloning failed.")
                } else {
                    clipboardy.writeSync(`cd ${localRepoPath}`)

                    logger.info(
                        "The repository path has been copied to your clipboard. You can now paste it into your terminal using CMD/CTRL + V."
                    )

                    await this.setUserConfig(resource)

                    db.add(localRepoPath)
                }
            })
            .stderr.on("data", (data) => process.stdout.write(data))
    }
}

export const cloneCommand = new CloneCommand()
