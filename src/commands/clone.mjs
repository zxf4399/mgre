import { spawn } from "node:child_process"
import { join } from "node:path"

import clipboardy from "clipboardy"
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

    cloneRepo(repoUrl) {
        const repoDirName = this.generateRepoDirName(repoUrl)

        const gitClone = spawn("git", [
            "clone",
            repoUrl,
            repoDirName,
            "--progress",
        ])

        gitClone.stderr.on("data", (data) => {
            process.stdout.write(data)
        })

        gitClone.on("close", (code) => {
            if (code !== 0) {
                logger.error("Failed to clone repository")
            } else {
                clipboardy.writeSync(`cd ${repoDirName}`)
                logger.info(
                    "The path to the repository has been copied to your clipboard. You can now paste it into your terminal using CMD/CTRL + V."
                )
            }
        })
    }

    run(repoUrl) {
        this.cloneRepo(repoUrl)
    }
}
