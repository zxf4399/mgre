import chalk from "chalk"

import db from "#db"

class FindCommand {
    async run(localRepoPath) {
        const repoLocalPaths = await db.get(localRepoPath)

        if (repoLocalPaths.length === 0) {
            process.exit(0)
        }

        console.log(
            chalk.cyan(
                repoLocalPaths.map((item) => item.local_repo_path).join("\n")
            )
        )
    }
}

export const findCommand = new FindCommand()
