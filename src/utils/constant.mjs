import { homedir } from "node:os"
import { join } from "node:path"

export const DEFAULT_CONFIG = {
    filename: "config.json",
    root: join(homedir(), ".mgre"),
}

export const CONFIG_PATH = join(DEFAULT_CONFIG.root, DEFAULT_CONFIG.filename)

export const DB_PATH = join(DEFAULT_CONFIG.root, "mgre.db")

export const CONFIG_FIELDS = {
    CODEBASES: "codebases",
}