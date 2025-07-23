import config from 'config';
import session from 'express-session';
import MongoStore from "connect-mongo";

function sessionMiddleware() {
    return session({
        store: MongoStore.create({
            mongoUrl: config.get('mongoUrl'),
            collectionName: config.get('dbSessionCollectionName'),
            ttl: 60 * 60, // 1 hour
        }),
        secret: config.get('session_key'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 3600000, // 1 hour
        },
    });
}

export default sessionMiddleware;
