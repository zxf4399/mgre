import { access } from "node:fs/promises"
import { join } from "node:path"

import * as p from "@clack/prompts"
import chalk from "chalk"
import clipboardy from "clipboardy"
import { execa } from "execa"
import GitUrlParse from "git-url-parse"

import { MGRE_CONIFG_FIELDS, mgreConfig } from "#config"
import { DEFAULT_CONFIG, MGRE_CONFIG_FILE_PATH } from "#constant"
import db from "#db"
import logger from "#logger"

class CloneCommand {
    getCodebase(resource) {
        return mgreConfig.get(MGRE_CONIFG_FIELDS.CODEBASES)?.[resource]
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

    get cancelMessage() {
        return chalk.red(
            `Clone operation cancelled by user. To retry, run ${chalk.bold(
                this.options.from === "import"
                    ? `mgre import ${this.options.baseDir}`
                    : `mgre clone ${this.gitUrl}`
            )}`
        )
    }

    async popupGitConfigPrompts(resource) {
        const skipGitConfig = await p.confirm({
            message: "Would you like to skip configuring Git user info?",
        })

        if (p.isCancel(skipGitConfig)) {
            p.cancel(this.cancelMessage)

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
                    p.cancel(this.cancelMessage)

                    process.exit(0)
                },
            }
        )

        return group
    }

    async checkCodebaseExists(resource) {
        try {
            await access(MGRE_CONFIG_FILE_PATH)

            const codebase = this.getCodebase(resource)

            if (this.isValidCodebase(codebase)) {
                return true
            }

            return false
        } catch (error) {
            return false
        }
    }

    saveConfigFile(group, resource) {
        if (group === null) return

        mgreConfig.set(MGRE_CONIFG_FIELDS.CODEBASES, {
            ...mgreConfig.get(MGRE_CONIFG_FIELDS.CODEBASES),
            [resource]: {
                email: group.email,
                name: group.name,
            },
        })
    }

    parseGitUrl() {
        const parsed = GitUrlParse(this.gitUrl)

        const { name, owner, resource } = parsed

        const localRepoPath = `${join(
            mgreConfig.get(MGRE_CONIFG_FIELDS.BASE),
            resource,
            owner,
            name
        )}`

        return [resource, localRepoPath]
    }

    checkBaseExists() {
        return !!mgreConfig.get(MGRE_CONIFG_FIELDS.BASE)
    }

    async popupBasePrompt() {
        const base = await p.text({
            initialValue: DEFAULT_CONFIG.root,
            message: `What is the base directory`,
        })

        if (p.isCancel(base)) {
            p.cancel(this.cancelMessage)

            process.exit(0)
        }

        mgreConfig.set(MGRE_CONIFG_FIELDS.BASE, base)
    }

    async run(gitUrl, options = {}) {
        this.gitUrl = gitUrl

        this.options = options

        const baseExists = this.checkBaseExists()

        if (!baseExists) {
            await this.popupBasePrompt()
        }

        const [resource, localRepoPath] = this.parseGitUrl()

        const codebaseExists = await this.checkCodebaseExists(resource)

        if (!codebaseExists) {
            const group = await this.popupGitConfigPrompts(resource)

            this.saveConfigFile(group, resource)
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
