import fs from "node:fs"
import { join } from "node:path"

const pkg = JSON.parse(
    fs.readFileSync(
        new URL(join("..", "..", "package.json"), import.meta.url),
        "utf-8"
    )
)

export default pkg
