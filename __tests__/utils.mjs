import { join } from "node:path"
import { cwd } from "node:process"

import { execaSync } from "execa"

import config from "#config"

const CLI_PATH = `${join(cwd(), "src", "index.mjs")}`

export const MGRE = "zxf4399/mgre"

export const MGRE_REPO_LOCAL_PATH = join(
    config.get("root"),
    "github.com",
    "zxf4399",
    "mgre"
)

export const MGRE_GIT_REPO_URL = `https://github.com/${MGRE}.git`

export const runCloneCommand = (url) =>
    execaSync("node", [CLI_PATH, "clone", url])

export const runFindCommand = (search) =>
    execaSync("node", [CLI_PATH, "find", search])
