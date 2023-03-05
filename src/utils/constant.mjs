import { homedir } from "node:os"
import { join } from "node:path"

export const DEFAULT_CONFIG = {
    filename: "config.json",
    root: join(homedir(), ".mgre"),
}

export const MGRE_CONFIG_FILE_PATH = join(
    DEFAULT_CONFIG.root,
    DEFAULT_CONFIG.filename
)

export const DB_FILE_PATH = join(DEFAULT_CONFIG.root, "mgre.db")

export const FIND_OUTPUT_FILE_PATH = join(DEFAULT_CONFIG.root, "output.txt")
