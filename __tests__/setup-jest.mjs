import {
    access,
    copyFile,
    mkdir,
    rename,
    rm,
    writeFile,
} from "node:fs/promises"

import { afterAll, beforeAll } from "@jest/globals"

import { DB_FILE_PATH, DEFAULT_CONFIG, MGRE_CONFIG_FILE_PATH } from "#constant"

const MGRE_CONFIG_BAK_FILE_PATH = `${MGRE_CONFIG_FILE_PATH}.bak`

const DB_BAK_FILE_PATH = `${DB_FILE_PATH}.bak`

const DATA = {
    base: DEFAULT_CONFIG.root,
    codebases: {
        "github.com": {
            email: "zxf4399@gmail.com",
            name: "zxf4399",
        },
    },
}

beforeAll(async () => {
    try {
        await access(DEFAULT_CONFIG.root)
    } catch (error) {
        await mkdir(DEFAULT_CONFIG.root)
    }

    try {
        await access(MGRE_CONFIG_FILE_PATH)

        await copyFile(MGRE_CONFIG_FILE_PATH, MGRE_CONFIG_BAK_FILE_PATH)
    } catch (error) {
        /* empty */
    }

    try {
        await access(DB_FILE_PATH)

        await copyFile(DB_FILE_PATH, DB_BAK_FILE_PATH)
    } catch (error) {
        /* empty */
    }

    await writeFile(
        MGRE_CONFIG_FILE_PATH,
        JSON.stringify(DATA, null, 2),
        "utf-8"
    )
})

afterAll(async () => {
    try {
        await access(MGRE_CONFIG_BAK_FILE_PATH)

        await rm(MGRE_CONFIG_FILE_PATH, { force: true })

        await rename(MGRE_CONFIG_BAK_FILE_PATH, MGRE_CONFIG_FILE_PATH)
    } catch (error) {
        /* empty */
    }

    try {
        await access(DB_BAK_FILE_PATH)

        await rm(DB_FILE_PATH, { force: true })

        await rename(DB_BAK_FILE_PATH, DB_FILE_PATH)
    } catch (error) {
        /* empty */
    }
})
