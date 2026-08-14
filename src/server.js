import "dotenv/config";

import express from "express";
import session from "express-session";
import cors from "cors";

import sessionStore from "./config/sessionStore.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

app.use(
    cors({
        origin: "https://auth-redis.onrender.com",
        credentials: true
    })
);

app.use(
    session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,

        proxy: true,

        cookie: {
            httpOnly: true,
            secure: true,
            sameSite: "none",
            maxAge: 1000 * 60 * 60
        }
    })
);

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        message: "Auth API fonctionne"
    });
});

app.get("/test-session", (req, res) => {
    console.log("===== TEST SESSION =====");
    console.log("SESSION ID:", req.sessionID);
    console.log("SESSION:", req.session);

    res.json({
        sessionId: req.sessionID,
        userId: req.session?.userId || null
    });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
