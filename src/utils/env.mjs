export default class Env {
    static instance

    static getInstance() {
        if (!Env.instance) {
            Env.instance = new Env()
        }

        return Env.instance
    }

    get isDev() {
        return process.env.NODE_ENV === "development"
    }
}
