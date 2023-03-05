import { rm, writeFile } from "node:fs/promises"

import { execa } from "execa"

import { FIND_OUTPUT_FILE_PATH } from "#constant"
import db from "#db"

class FindCommand {
    async run(localRepoPath) {
        const repoLocalPaths = await db.get(localRepoPath)

        if (repoLocalPaths.length === 0) {
            process.exit(0)
        }

        await writeFile(
            FIND_OUTPUT_FILE_PATH,
            repoLocalPaths.map((item) => item.local_repo_path).join("\n"),
            "utf-8"
        )

        await execa("grep", [localRepoPath, FIND_OUTPUT_FILE_PATH, "--color"], {
            stdio: "inherit",
        })

        rm(FIND_OUTPUT_FILE_PATH, { force: true })
    }
}

export const findCommand = new FindCommand()
