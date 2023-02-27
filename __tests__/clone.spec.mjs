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
    test("Store the contents of the Git repository in a directory with a standardized name.", () => {
        // TODO: Handle errors that may occur when executing the "git clone" command.
        runCloneCommand(MGRE_GIT_REPO_URL)

        expect(existsSync(MGRE_REPO_LOCAL_PATH)).toBeTruthy()
    })

    test("The Git user config is set correctly when the Git repository is successfully cloned.", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)

        execaSync("cd", [MGRE_REPO_LOCAL_PATH])

        const codebase = config
            .get("codebases")
            ?.find((item) => item.url === "github.com")

        if (codebase?.name && codebase?.email) {
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

    test("Output a failure log when a directory with a standardized name already exists.", () => {
        runCloneCommand(MGRE_GIT_REPO_URL)

        const childProcessResult = runCloneCommand(MGRE_GIT_REPO_URL)

        expect(childProcessResult.stdout).toMatch("Repository cloning failed")
    })
})
