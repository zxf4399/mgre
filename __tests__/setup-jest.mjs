import {
    copyFileSync,
    existsSync,
    renameSync,
    rmSync,
    writeFileSync,
} from "node:fs"
import { join } from "node:path"

import { afterAll, beforeAll } from "@jest/globals"

import config from "#config"
import db from "#db"

const FILE_PATH = join(config.defaultConfig.root, config.defaultConfig.filename)
const BAK_FILE_PATH = `${FILE_PATH}.bak`
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

    if (existsSync(FILE_PATH)) {
        copyFileSync(FILE_PATH, BAK_FILE_PATH)
    }

    writeFileSync(FILE_PATH, JSON.stringify(DATA, null, 2), "utf-8")
})

afterAll(async () => {
    await db.close()

    if (existsSync(BAK_FILE_PATH)) {
        rmSync(FILE_PATH, { force: true })

        renameSync(BAK_FILE_PATH, FILE_PATH)
    }
})
