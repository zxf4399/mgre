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

    generateRepoDirName(url) {
        const parsed = GitUrlParse(url)

        return `${join(
            config.get("root"),
            parsed.resource,
            parsed.owner,
            parsed.name
        )}`
    }

    async cloneRepo(repoUrl) {
        const repoDirName = this.generateRepoDirName(repoUrl)

        await execa("git", ["clone", repoUrl, repoDirName, "--progress"])
            .on("close", (code) => {
                if (code !== 0) {
                    logger.error("Failed to clone repository")
                } else {
                    clipboardy.writeSync(`cd ${repoDirName}`)
                    logger.info(
                        "The path to the repository has been copied to your clipboard. You can now paste it into your terminal using CMD/CTRL + V."
                    )
                }
            })
            .stderr.on("data", (data) => process.stdout.write(data))
    }

    run(repoUrl) {
        this.cloneRepo(repoUrl)
    }
}
