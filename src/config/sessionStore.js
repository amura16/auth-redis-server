import session from "express-session";
import redis from "./redis.js";

class UpstashSessionStore extends session.Store {

    get(sid, callback) {
        redis
            .get(`session:${sid}`)
            .then((data) => {
                if (!data) {
                    return callback(null, null);
                }

                callback(null, data);
            })
            .catch(callback);
    }

    set(sid, sessionData, callback) {
        const maxAge = sessionData?.cookie?.maxAge;

        const ttl = maxAge
            ? Math.ceil(maxAge / 1000)
            : 3600;

        redis
            .set(
                `session:${sid}`,
                sessionData,
                { ex: ttl }
            )
            .then(() => callback(null))
            .catch(callback);
    }

    destroy(sid, callback) {
        redis
            .del(`session:${sid}`)
            .then(() => callback(null))
            .catch(callback);
    }

    touch(sid, sessionData, callback) {
        const maxAge = sessionData?.cookie?.maxAge;

        const ttl = maxAge
            ? Math.ceil(maxAge / 1000)
            : 3600;

        redis
            .expire(`session:${sid}`, ttl)
            .then(() => callback(null))
            .catch(callback);
    }
}

export default new UpstashSessionStore();
