import {
    copyFileSync,
    existsSync,
    renameSync,
    rmSync,
    writeFileSync,
} from "node:fs"

import { afterAll, beforeAll } from "@jest/globals"

import { CONFIG_FILE_PATH } from "#constant"
import db from "#db"

const BAK_FILE_PATH = `${CONFIG_FILE_PATH}.bak`

const DATA = {
    codebases: [
        {
            email: "zxf4399@gmail.com",
            name: "zxf4399",
            url: "github.com",
        },
    ],
}

beforeAll(async () => {
    await db.init()

    if (existsSync(CONFIG_FILE_PATH)) {
        copyFileSync(CONFIG_FILE_PATH, BAK_FILE_PATH)
    }

    writeFileSync(CONFIG_FILE_PATH, JSON.stringify(DATA, null, 2), "utf-8")
})

afterAll(async () => {
    await db.close()

    if (existsSync(BAK_FILE_PATH)) {
        rmSync(CONFIG_FILE_PATH, { force: true })

        renameSync(BAK_FILE_PATH, CONFIG_FILE_PATH)
    }
})
