import session from "express-session";
import redis from "./redis.js";

class UpstashSessionStore extends session.Store {

    get(sid, callback) {
        redis
            .get(`session:${sid}`)
            .then((data) => {

                console.log(
                    "SESSION GET:",
                    sid,
                    data
                );

                if (!data) {
                    return callback(null, null);
                }

                callback(null, data);
            })
            .catch((error) => {
                console.error(
                    "SESSION GET ERROR:",
                    error
                );

                callback(error);
            });
    }

    set(sid, sessionData, callback) {

        const maxAge = sessionData?.cookie?.maxAge;

        const ttl = maxAge
            ? Math.ceil(maxAge / 1000)
            : 3600;

        console.log(
            "SESSION SET:",
            sid,
            sessionData
        );

        redis
            .set(
                `session:${sid}`,
                sessionData,
                {
                    ex: ttl
                }
            )
            .then(() => {
                console.log(
                    "SESSION SET OK:",
                    sid
                );

                callback(null);
            })
            .catch((error) => {
                console.error(
                    "SESSION SET ERROR:",
                    error
                );

                callback(error);
            });
    }

    destroy(sid, callback) {

        redis
            .del(`session:${sid}`)
            .then(() => {
                console.log(
                    "SESSION DESTROY:",
                    sid
                );

                callback(null);
            })
            .catch((error) => {
                console.error(
                    "SESSION DESTROY ERROR:",
                    error
                );

                callback(error);
            });
    }

    touch(sid, sessionData, callback) {

        const maxAge = sessionData?.cookie?.maxAge;

        const ttl = maxAge
            ? Math.ceil(maxAge / 1000)
            : 3600;

        redis
            .expire(
                `session:${sid}`,
                ttl
            )
            .then(() => {
                callback(null);
            })
            .catch((error) => {
                console.error(
                    "SESSION TOUCH ERROR:",
                    error
                );

                callback(error);
            });
    }
}

export default new UpstashSessionStore();
