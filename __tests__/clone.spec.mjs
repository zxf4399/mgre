import { existsSync, rmSync } from "node:fs"
import { join } from "node:path"
import { cwd } from "node:process"

import { beforeEach, describe, expect, test } from "@jest/globals"
import { execaSync } from "execa"

import config from "#config"

const CLI_PATH = `${join(cwd(), "src", "index.mjs")}`

const mgreDir = join(config.get("root"), "github.com", "zxf4399", "mgre")

beforeEach(() => {
    if (existsSync(mgreDir)) {
        rmSync(mgreDir, { recursive: true, force: true })
    }
})

describe("clone", () => {
    test("Store the content of the Git repository in a directory with a standard name", () => {
        execaSync("node", [
            CLI_PATH,
            "clone",
            "https://github.com/zxf4399/mgre.git",
        ])

        expect(existsSync(mgreDir)).toBeTruthy()
    })

    test("print a failure log when the standard name directory already exists ", () => {
        execaSync("node", [
            CLI_PATH,
            "clone",
            "https://github.com/zxf4399/mgre.git",
        ])

        const childProcessResult = execaSync("node", [
            CLI_PATH,
            "clone",
            "https://github.com/zxf4399/mgre.git",
        ])

        expect(childProcessResult.stdout).toMatch("Failed to clone repository")
    })

    // TODO clone user.name & user.email
})
