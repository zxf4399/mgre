import { execSync } from "node:child_process"
import { existsSync, rmSync } from "node:fs"
import { join } from "node:path"
import { cwd } from "node:process"

import { beforeEach, describe, expect, test } from "@jest/globals"

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
        execSync(`node ${CLI_PATH} clone https://github.com/zxf4399/mgre.git`, {
            encoding: "utf-8",
        })

        expect(existsSync(mgreDir)).toBeTruthy()
    })

    test("print a failure log when the standard name directory already exists ", () => {
        execSync(`node ${CLI_PATH} clone https://github.com/zxf4399/mgre.git`, {
            encoding: "utf-8",
        })

        const secondExec = execSync(
            `node ${CLI_PATH} clone https://github.com/zxf4399/mgre.git`,
            {
                encoding: "utf-8",
            }
        )

        expect(secondExec).toMatch("Failed to clone repository")
    })
})
