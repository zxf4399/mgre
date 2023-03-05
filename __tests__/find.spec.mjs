import { describe, expect, test } from "@jest/globals"

import {
    MGRE,
    MGRE_GIT_REPO_URL,
    runCloneCommand,
    runFindCommand,
} from "./utils.mjs"

describe("find command", () => {
    test("can find this repository local path if exist this codebase", async () => {
        await runCloneCommand(MGRE_GIT_REPO_URL)

        const { stdout } = await runFindCommand(MGRE)

        expect(stdout).toMatch(MGRE)
    })

    test("can not find this repository local path if not exist this codebase", async () => {
        const { stdout } = await runFindCommand("xxx")

        expect(stdout).toBeFalsy()
    })
})
