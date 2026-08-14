import "dotenv/config";

import express from "express";
import session from "express-session";
import cors from "cors";

import sessionStore from "./config/sessionStore.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

/*
 * CORS
 */
app.use(
    cors({
        origin: "https://auth-redis.onrender.com",
        credentials: true
    })
);

/*
 * Session
 */
app.use(
    session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET,

        resave: false,
        saveUninitialized: false,

        cookie: {
            httpOnly: true,

            // HTTPS sur Render
            secure: true,

            // Frontend et backend sont sur des origines différentes
            sameSite: "none",

            maxAge: 1000 * 60 * 60
        }
    })
);

/*
 * Routes
 */
app.use("/auth", authRoutes);

/*
 * Test API
 */
app.get("/", (req, res) => {
    res.json({
        message: "Auth API fonctionne"
    });
});

/*
 * Port Render
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(
        `Server running on port ${PORT}`
    );
});
