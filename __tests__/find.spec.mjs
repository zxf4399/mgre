import { rmSync } from "node:fs"

import { afterEach, beforeEach, describe, expect, test } from "@jest/globals"

import db from "#db"

import {
    MGRE,
    MGRE_GIT_REPO_URL,
    MGRE_REPO_LOCAL_PATH,
    runCloneCommand,
    runFindCommand,
} from "./utils.mjs"

beforeEach(async () => {
    rmSync(MGRE_REPO_LOCAL_PATH, { force: true, recursive: true })
    await db.remove(MGRE_REPO_LOCAL_PATH)
})

afterEach(() => {
    rmSync(MGRE_REPO_LOCAL_PATH, { force: true, recursive: true })
})

describe("find command", () => {
    test("can find this repository local path if exist this codebase", async () => {
        const repoLocalPaths = await db.get(MGRE)

        expect(repoLocalPaths).toHaveLength(0)

        runCloneCommand(MGRE_GIT_REPO_URL)

        const { stdout } = runFindCommand(MGRE)

        expect(stdout).toMatch(`github.com/${MGRE}`)
    })

    test("can not find this repository local path if not exist this codebase", async () => {
        const repoLocalPaths = await db.get(MGRE)

        expect(repoLocalPaths).toHaveLength(0)

        const { stdout } = runFindCommand(MGRE)

        expect(stdout).toMatch(
            `Can not find the repoLocalPath: ${MGRE} in the database.`
        )
    })
})
