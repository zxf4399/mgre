import { access } from "node:fs/promises"
import { join } from "node:path"

import * as p from "@clack/prompts"
import { cancel, isCancel } from "@clack/prompts"
import chalk from "chalk"
import clipboardy from "clipboardy"
import { execa } from "execa"
import GitUrlParse from "git-url-parse"

import config from "#config"
import { CONFIG_FIELDS, CONFIG_PATH, DEFAULT_CONFIG } from "#constant"
import db from "#db"
import logger from "#logger"

class CloneCommand {
    getCodebase(resource) {
        return config.get(CONFIG_FIELDS.CODEBASES)?.[resource]
    }

    isValidCodebase(codebase) {
        return !!codebase?.name && !!codebase?.email
    }

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
            } catch (error) {
                logger.error(error.message)
            }
        }
    }

    async popupPrompts(resource, localRepoPath) {
        const skipGitConfig = await p.confirm({
            message: "Would you like to skip configuring Git user info?",
        })

        if (isCancel(skipGitConfig)) {
            cancel(
                chalk.red(
                    `Clone operation cancelled by user. To retry, run ${chalk.bold(
                        this.options.from === "import"
                            ? `mgre import ${this.options.baseDir}`
                            : `mgre clone ${localRepoPath}`
                    )}`
                )
            )

            process.exit(0)
        }

        if (skipGitConfig) {
            return null
        }

        const { stdout: username } = await execa("git", ["config", "user.name"])

        const { stdout: useremail } = await execa("git", [
            "config",
            "user.email",
        ])

        const group = await p.group(
            {
                name: () =>
                    p.text({
                        initialValue: username,
                        message: `What is your Git username for "${resource}"?`,
                    }),
                // eslint-disable-next-line sort-keys
                email: () =>
                    p.text({
                        initialValue: useremail,
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

    async updateConfigFile(group, resource) {
        if (group === null) return

        await config.update({
            [CONFIG_FIELDS.CODEBASES]: {
                [resource]: {
                    email: group.email,
                    name: group.name,
                },
            },
        })
    }

    parseGitUrl() {
        const parsed = GitUrlParse(this.gitUrl)

        const { name, owner, resource } = parsed

        const localRepoPath = `${join(
            DEFAULT_CONFIG.root,
            resource,
            owner,
            name
        )}`

        return [resource, localRepoPath]
    }

    async run(gitUrl, options) {
        this.gitUrl = gitUrl

        this.options = options

        const [resource, localRepoPath] = this.parseGitUrl()

        const codebaseExists = await this.checkCodebaseExists(resource)

        if (!codebaseExists) {
            const group = await this.popupPrompts(resource, localRepoPath)

            await this.updateConfigFile(group, resource)
        }

        return new Promise((resolve) => {
            execa("git", ["clone", this.gitUrl, localRepoPath, "--progress"])
                .on("close", async (code) => {
                    if (code === 0) {
                        clipboardy.writeSync(`cd ${localRepoPath}`)

                        await this.setUserConfig(resource, localRepoPath)

                        db.add(localRepoPath)
                    }

                    resolve()
                })
                .stderr.on("data", (buffer) => {
                    if (buffer.toString().startsWith("fatal")) {
                        console.log(chalk.red(buffer.toString()))
                    } else {
                        process.stdout.write(buffer)
                    }
                })
        })
    }
}

export const cloneCommand = new CloneCommand()
