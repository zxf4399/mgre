import { join } from "node:path"

import clipboardy from "clipboardy"
import { execa } from "execa"
import GitUrlParse from "git-url-parse"

import Config from "#config"
import logger from "#logger"

const config = Config.getInstance()

export default class CloneCommand {
    static instance

    static getInstance() {
        if (!CloneCommand.instance) {
            CloneCommand.instance = new CloneCommand()
        }

        return CloneCommand.instance
    }

    generateRepoDir(url) {
        const parsed = GitUrlParse(url)

        this.resource = parsed.resource
        this.repoDir = `${join(
            config.get("root"),
            this.resource,
            parsed.owner,
            parsed.name
        )}`
    }

    async setUserConfig() {
        const { name, email } = config
            .get("codebases")
            .find((codebase) => codebase.url === this.resource)

        if (name && email) {
            await Promise.all([
                execa("git", ["config", "--replace-all", "user.name", name], {
                    cwd: this.repoDir,
                }),
                execa("git", ["config", "--replace-all", "user.email", email], {
                    cwd: this.repoDir,
                }),
            ])

            logger.info(
                `Your configuration username and email of ${this.resource} has been set successfully for the repository.`
            )
        }
    }

    async cloneRepo(repoUrl) {
        this.generateRepoDir(repoUrl)

        await execa("git", ["clone", repoUrl, this.repoDir, "--progress"])
            .on("close", async (code) => {
                if (code !== 0) {
                    logger.error("Failed to clone repository")
                } else {
                    clipboardy.writeSync(`cd ${this.repoDir}`)
                    logger.info(
                        "The path to the repository has been copied to your clipboard. You can now paste it into your terminal using CMD/CTRL + V."
                    )
                    await this.setUserConfig()
                }
            })
            .stderr.on("data", (data) => process.stdout.write(data))
    }

    run(url) {
        this.cloneRepo(url)
    }
}
