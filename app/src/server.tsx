/**
 * Server-side Express application
 * - API methods
 * - entry-point to shared React App
 *
 */
import pgConnect from 'connect-pg-simple';
import express from 'express';
import session from 'express-session';

import apiServer from './api/api';
import db from './db';
import frontendRoute from './frontendRoute';
import tileserver from './tiles/tileserver';

// create server
const server = express();

// disable header
server.disable('x-powered-by');

// serve static files
server.use(express.static(process.env.RAZZLE_PUBLIC_DIR));

// handle user sessions
let sessionStore: any = undefined;
if (process.env.NODE_ENV === 'production') {
    try {
        const pgSession = pgConnect(session);
        sessionStore = new pgSession({
            pgPromise: db,
            tableName: 'user_sessions',
            pruneSessionInterval: false,
            errorLog: (err: any) => {}
        });
    } catch (e) {
        // Fallback a memoria
    }
}

const sess: any = { // TODO: remove any
    name: 'cl.session',
    // en desarrollo (sin PostgreSQL) las sesiones viven en memoria
    store: process.env.NODE_ENV === 'production' ? sessionStore : undefined,
    secret: process.env.APP_COOKIE_SECRET || '123456',
    saveUninitialized: false,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
};
if (server.get('env') === 'production') {
    // trust first proxy
    server.set('trust proxy', 1);
    // serve secure cookies
    sess.cookie.secure = true;
}
server.use(session(sess));

// Modo desarrollo sin base de datos: sesion automatica con usuario local
// para poder editar edificios sin PostgreSQL. Nunca se activa en produccion.
if (process.env.NODE_ENV !== 'production') {
    server.use((req: any, _res, next) => {
        if (req.session && !req.session.user_id) {
            req.session.user_id = 'dev-santiago';
        }
        next();
    });
}

server.use('/tiles', tileserver);
server.use('/api', apiServer);
server.use(frontendRoute);

export default server;
