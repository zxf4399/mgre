import sqlite3 from "sqlite3"

import { DB_PATH } from "#constant"
import logger from "#logger"

class Database {
    async init() {
        await this.#connect()

        await this.#create()
    }

    #connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(DB_PATH, (err) => {
                if (err) {
                    logger.error(err.message)

                    reject()
                }

                logger.debug("Connected to the database successfully.")

                resolve()
            })
        })
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    logger.error(err.message)

                    reject()
                }

                logger.debug("Disconnected from the database successfully.")

                resolve()
            })
        })
    }

    #create() {
        // TODO: Add mgre table exists check to avoid debug logger confuse
        return new Promise((resolve, reject) => {
            this.db.run(
                `CREATE TABLE IF NOT EXISTS mgre (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                local_repo_path TEXT UNIQUE NOT NULL
            )`,
                (err) => {
                    if (err) {
                        logger.error(err.message)

                        reject()
                    }

                    logger.debug("Created mgre table successfully.")

                    resolve()
                }
            )
        })
    }

    add(localRepoPath) {
        this.db.run(
            `INSERT INTO mgre (local_repo_path) VALUES (?)`,
            [localRepoPath],
            (err) => {
                if (err) {
                    logger.error(err.message)
                }

                logger.debug("Added localRepoPath successfully.")
            }
        )
    }

    remove(localRepoPath) {
        this.db.run(
            `DELETE FROM mgre WHERE local_repo_path = ?`,
            [localRepoPath],
            (err) => {
                if (err) {
                    logger.error(err.message)
                }

                logger.debug("Removed localRepoPath successfully.")
            }
        )
    }

    get(localRepoPath) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM mgre WHERE local_repo_path LIKE ?`,
                [`%${localRepoPath}%`],
                (err, rows) => {
                    if (err) {
                        logger.error(err.message)

                        reject()
                    }

                    logger.debug("Get repoLocalPaths successfully.")

                    resolve(rows)
                }
            )
        })
    }
}

const db = new Database()

export default db
