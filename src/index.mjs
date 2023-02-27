import { Command } from "commander"

import db from "#db"
import pkg from "#pkg"

import CloneCommand from "./commands/clone.mjs"
import { findCommand } from "./commands/index.mjs"

const program = new Command()

function setUpProgram() {
    program.name(pkg.name).version(pkg.version)

    program
        .command("clone <url>")
        .description(
            "Clone a Git repository using a specified URL and store it in a newly created directory with a standard name"
        )
        .action((url) => CloneCommand.getInstance().run(url))

    program
        .command("find <repoLocalPath>")
        .description(
            "Find a Git repository by its local path, supports fuzzy search"
        )
        .action(findCommand.run)

    program.parse(process.argv)
}

async function main() {
    await db.init()
    setUpProgram()
}

main()
