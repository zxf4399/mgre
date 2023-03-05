import { join } from "node:path"
import { cwd } from "node:process"

import { execa } from "execa"

import { DEFAULT_CONFIG } from "#constant"

const CLI_PATH = `${join(cwd(), "src", "index.mjs")}`

export const MGRE = "zxf4399/mgre"

export const MGRE_REPO_LOCAL_PATH = join(
    DEFAULT_CONFIG.root,
    "github.com",
    "zxf4399",
    "mgre"
)

export const MGRE_GIT_REPO_URL = `https://github.com/${MGRE}.git`

export const runCloneCommand = (gitUrl) =>
    execa("node", [CLI_PATH, "clone", gitUrl])

export const runFindCommand = (localRepoPath) =>
    execa("node", [CLI_PATH, "find", localRepoPath])

export const runRmCommand = () => execa("node", [CLI_PATH, "rm"])
