import { readdir, stat } from "node:fs/promises"
import { join } from "node:path"

import { execa } from "execa"

import logger from "#logger"

import { cloneCommand } from "./clone.mjs"

class ImportCommand {
    async findGitRepoPaths(baseDir) {
        const gitRepos = []

        const excludeDirs = ["node_modules"]

        try {
            const files = await readdir(baseDir)

            await Promise.all(
                files.map(async (file) => {
                    const filePath = join(baseDir, file)

                    const fileStat = await stat(filePath)

                    if (
                        !gitRepos.includes(baseDir) &&
                        !excludeDirs.includes(file) &&
                        fileStat.isDirectory()
                    ) {
                        if (file === ".git") {
                            gitRepos.push(baseDir)
                        } else {
                            gitRepos.push(
                                ...(await this.findGitRepoPaths(filePath))
                            )
                        }
                    }
                })
            )
        } catch (error) {
            logger.error(error.message)
        }

        return gitRepos
    }

    async getGitRemoteOriginUrls(gitRepoPaths) {
        const remoteOriginUrls = []

        await Promise.all(
            gitRepoPaths.map(async (gitRepoPath) => {
                try {
                    const { stdout } = await execa(
                        "git",
                        ["config", "--get", "remote.origin.url"],
                        {
                            cwd: gitRepoPath,
                        }
                    )

                    remoteOriginUrls.push(stdout)
                } catch (error) {
                    /* empty */
                }
            })
        )

        return remoteOriginUrls
    }

    async cloneGitRepos(gitRemoteOriginUrls) {
        for (const gitRemoteOriginUrl of gitRemoteOriginUrls) {
            await cloneCommand.run(gitRemoteOriginUrl, {
                baseDir: this.baseDir,
                from: "import",
            })
        }
    }

    async run(baseDir) {
        this.baseDir = baseDir

        const gitRepoPaths = await this.findGitRepoPaths(baseDir)

        const gitRemoteOriginUrls = await this.getGitRemoteOriginUrls(
            gitRepoPaths
        )

        await this.cloneGitRepos(gitRemoteOriginUrls)
    }
}

export const importCommand = new ImportCommand()
