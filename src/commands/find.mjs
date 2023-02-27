import { cancel, intro, isCancel, note, outro, select } from "@clack/prompts"
import pc from "picocolors"

import db from "#db"
import logger from "#logger"

class FindCommand {
    async run(search) {
        try {
            const repoLocalPaths = await db.get(search)

            intro("Found the localRepoPath in the database.")

            const selectRepoLocalPath = await select({
                message: "Select a localRepoPath",
                options: repoLocalPaths.map((item) => ({
                    label: item.local_repo_path,
                    value: item.local_repo_path,
                })),
            })

            if (isCancel(selectRepoLocalPath)) {
                logger.debug("User canceled the find prompt operation.")

                cancel('Find canceled by user. Run "mgre find" to try again.')

                process.exit(0)
            }

            note(`cd ${selectRepoLocalPath}`, "Next steps")

            outro(
                `Problems? ${pc.underline(
                    pc.cyan("https://github.com/zxf4399/mgre/issues")
                )}`
            )
        } catch (error) {
            logger.error(
                `Can not find the localRepoPath: ${search} in the database.`
            )
        }
    }
}

export const findCommand = new FindCommand()
