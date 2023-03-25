import { existsSync } from "node:fs"

import { describe, expect, test } from "@jest/globals"
import { execa } from "execa"

import { MGRE_CONIFG_FIELDS, mgreConfig } from "#config"

import {
    MGRE_GIT_REPO_URL,
    MGRE_REPO_LOCAL_PATH,
    runCloneCommand,
} from "./utils.mjs"

describe("clone command", () => {
    test("Store the contents of the Git repository in a directory with a standardized name.", async () => {
        await runCloneCommand(MGRE_GIT_REPO_URL)

        expect(existsSync(MGRE_REPO_LOCAL_PATH)).toBeTruthy()
    })

    test("The Git user config is set correctly when the Git repository is successfully cloned.", async () => {
        await runCloneCommand(MGRE_GIT_REPO_URL)

        const codebase = mgreConfig.get(MGRE_CONIFG_FIELDS.CODEBASES)?.[
            "github.com"
        ]

        if (codebase?.name && codebase?.email) {
            const { stdout: username } = await execa(
                "git",
                ["config", "user.name"],
                {
                    cwd: MGRE_REPO_LOCAL_PATH,
                }
            )

            expect(username).toBe(codebase.name)

            const { stdout: useremail } = await execa(
                "git",
                ["config", "user.email"],
                {
                    cwd: MGRE_REPO_LOCAL_PATH,
                }
            )

            expect(useremail).toBe(codebase.email)
        }
    })

    test("Output a failure log when a directory with a standardized name already exists.", async () => {
        await runCloneCommand(MGRE_GIT_REPO_URL)

        const childProcessResult = await runCloneCommand(MGRE_GIT_REPO_URL)

        expect(childProcessResult.stdout).toMatch("already exists")
    })
})
