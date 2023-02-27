import { existsSync } from "node:fs"

import { describe, expect, test } from "@jest/globals"
import { execaSync } from "execa"

import config from "#config"

import {
    MGRE_GIT_REPO_URL,
    MGRE_REPO_LOCAL_PATH,
    runCloneCommand,
} from "./utils.mjs"

describe("clone command", () => {
    test("Store the content of the Git repository in a directory with a standard name", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)

        expect(existsSync(MGRE_REPO_LOCAL_PATH)).toBeTruthy()
    })

    test("the user git config is setted right when clone git repository successfully", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)

        execaSync("cd", [MGRE_REPO_LOCAL_PATH])

        const codebase = config
            .get("codebases")
            ?.find((item) => item.url === "github.com")

        if (codebase.name && codebase.email) {
            const { stdout: userName } = execaSync("git", [
                "config",
                "user.name",
            ])

            expect(userName).toBe(codebase.name)

            const { stdout: userEmail } = execaSync("git", [
                "config",
                "user.email",
            ])

            expect(userEmail).toBe(codebase.email)
        }
    })

    test("print a failure log when the standard name directory already exists ", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)

        const childProcessResult = runCloneCommand(MGRE_GIT_REPO_URL)

        expect(childProcessResult.stdout).toMatch("Failed to clone repository")
    })
})
