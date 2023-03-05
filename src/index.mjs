import { Command } from "commander"

import db from "#db"
import pkg from "#pkg"

import {
    cloneCommand,
    findCommand,
    importCommand,
    rmCommand,
} from "./commands/index.mjs"

const program = new Command()

function setUpProgram() {
    program.name(pkg.name).version(pkg.version)

    program
        .command("clone <gitUrl>")
        .description(
            "Clone a Git repository using a specified URL and store it in a newly created directory with a standard name"
        )
        .action((gitUrl) => cloneCommand.run(gitUrl))

    program
        .command("find <localRepoPath>")
        .description(
            "Find a Git repository by its local path, supports fuzzy search"
        )
        .action((localRepoPath) => findCommand.run(localRepoPath))

    program
        .command("import <baseDir>")
        .description("Import all Git repositories from a directory")
        .action((baseDir) => importCommand.run(baseDir))

    program
        .command("rm")
        .description("Remove configuration file and database file")
        .action(() => rmCommand.run())

    program.parse(process.argv)
}

async function main() {
    await db.init()

    setUpProgram()
}

main()
