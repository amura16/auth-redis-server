import "dotenv/config";

import express from "express";
import session from "express-session";
import cors from "cors";

import sessionStore from "./config/sessionStore.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(express.json());

app.use(cors({
    origin: "https://auth-redis.onrender.com",
    credentials: true
}));

app.use(
    session({
        store: sessionStore,
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: false,
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

app.listen(process.env.PORT, () => {
    console.log(
        `Server running on http://localhost:${process.env.PORT}`
    );
});
