import { existsSync } from "node:fs"

import { describe, expect, test } from "@jest/globals"

import { DB_FILE_PATH, MGRE_CONFIG_FILE_PATH } from "#constant"

import { runRmCommand } from "./utils.mjs"

describe("rm command", () => {
    test("remove config file and database file successfully", async () => {
        await runRmCommand()

        expect(existsSync(MGRE_CONFIG_FILE_PATH)).toBeFalsy()

        expect(existsSync(DB_FILE_PATH)).toBeFalsy()
    })
})
