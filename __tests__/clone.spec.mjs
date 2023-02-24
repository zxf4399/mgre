import { existsSync, rmSync, writeFileSync } from "node:fs"
import { join } from "node:path"
import { cwd } from "node:process"

import { beforeAll, beforeEach, describe, expect, test } from "@jest/globals"
import { execaSync } from "execa"

import Config from "#config"

const config = Config.getInstance()
const CLI_PATH = `${join(cwd(), "src", "index.mjs")}`
const MGRE_GIT_REPO_URL = "https://github.com/zxf4399/mgre.git"
const MGRE_REPO_DIR = join(config.get("root"), "github.com", "zxf4399", "mgre")

beforeAll(() => {
    // TODO: backup the original config file and restore it after all tests
    writeFileSync(
        join(Config.defaultConfig.root, Config.defaultConfig.filename),
        JSON.stringify(
            {
                codebases: [
                    {
                        email: "zxf4399@gmail.com",
                        name: "zxf4399",
                        url: "github.com",
                    },
                ],
            },
            null,
            2
        ),
        "utf-8"
    )
})

beforeEach(() => {
    if (existsSync(MGRE_REPO_DIR)) {
        rmSync(MGRE_REPO_DIR, { recursive: true, force: true })
    }
})

const runCloneCommand = (repoUrl) =>
    execaSync("node", [CLI_PATH, "clone", repoUrl])

describe("clone", () => {
    test("Store the content of the Git repository in a directory with a standard name", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)
        expect(existsSync(MGRE_REPO_DIR)).toBeTruthy()
    })

    test("the user git config is setted right when clone git repository successfully", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)
        execaSync("cd", [MGRE_REPO_DIR])

        const { name, email } = config
            .get("codebases")
            .find((codebase) => codebase.url === "github.com")
        const { stdout: userName } = execaSync("git", ["config", "user.name"])

        expect(userName).toBe(name)

        const { stdout: userEmail } = execaSync("git", ["config", "user.email"])

        expect(userEmail).toBe(email)
    })

    test("print a failure log when the standard name directory already exists ", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)

        const childProcessResult = runCloneCommand(MGRE_GIT_REPO_URL)

        expect(childProcessResult.stdout).toMatch("Failed to clone repository")
    })
})
