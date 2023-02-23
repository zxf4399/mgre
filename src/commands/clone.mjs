import { join } from "node:path"

import clipboardy from "clipboardy"
import { execa } from "execa"
import GitUrlParse from "git-url-parse"

import config from "#config"
import logger from "#logger"

export default class CloneCommand {
    static instance

    static getInstance() {
        if (!CloneCommand.instance) {
            CloneCommand.instance = new CloneCommand()
        }

        return CloneCommand.instance
    }

    generateRepodir(url) {
        const parsed = GitUrlParse(url)

        this.resource = parsed.resource
        this.repodir = `${join(
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

        await Promise.all([
            execa("git", ["config", "--replace-all", "user.name", name], {
                cwd: this.repodir,
            }),
            execa("git", ["config", "--replace-all", "user.email", email], {
                cwd: this.repodir,
            }),
        ])

        logger.info(
            'Your codebase "user.name" and "user.email" have been set successfully.'
        )
    }

    async cloneRepo(repoUrl) {
        this.generateRepodir(repoUrl)

        await execa("git", ["clone", repoUrl, this.repodir, "--progress"])
            .on("close", async (code) => {
                if (code !== 0) {
                    logger.error("Failed to clone repository")
                } else {
                    clipboardy.writeSync(`cd ${this.repodir}`)
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
