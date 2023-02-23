import { Command } from "commander"

import pkg from "#pkg"

import CloneCommand from "./commands/clone.mjs"

const program = new Command()

program.name(pkg.name).version(pkg.version)

program
    .command("clone <url>")
    .description(
        "Clone a Git repository using a specified URL and store it in a newly created directory with a standard name"
    )
    .action((url) => CloneCommand.getInstance().run(url))

program.parse(process.argv)
