import sqlite3 from "sqlite3"

import logger from "#logger"

const FILE_NAME = "mgre.db"

class Database {
    async init() {
        await this.#connect()
        await this.#create()
    }

    #connect() {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(FILE_NAME, (err) => {
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
                repo_local_path TEXT UNIQUE NOT NULL
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

    add(repoLocalPath) {
        this.db.run(
            `INSERT INTO mgre (repo_local_path) VALUES (?)`,
            [repoLocalPath],
            (err) => {
                if (err) {
                    logger.error(err.message)
                }

                logger.debug("Added repoLocalPath successfully.")
            }
        )
    }

    remove(repoLocalPath) {
        this.db.run(
            `DELETE FROM mgre WHERE repo_local_path = ?`,
            [repoLocalPath],
            (err) => {
                if (err) {
                    logger.error(err.message)
                }

                logger.debug("Removed repoLocalPath successfully.")
            }
        )
    }

    get(repoLocalPath) {
        return new Promise((resolve, reject) => {
            this.db.all(
                `SELECT * FROM mgre WHERE repo_local_path LIKE ?`,
                [`%${repoLocalPath}%`],
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
