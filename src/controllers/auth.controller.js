import bcrypt from "bcrypt";
import redis from "../config/redis.js";

export const register = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email et mot de passe obligatoires"
            });
        }

        // Vérifier si l'email existe déjà
        const existingUserId = await redis.get(
            `user:email:${email}`
        );

        if (existingUserId) {
            return res.status(409).json({
                message: "Cet email existe déjà"
            });
        }

        // Générer un ID utilisateur
        const userId = await redis.incr("users:id");

        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 12);

        const createdAt = new Date().toISOString();

        // Stocker l'utilisateur
        await redis.hset(`user:${userId}`, {
            id: userId,
            email,
            password: hashedPassword,
            created_at: createdAt
        });

        // Index email → ID utilisateur
        await redis.set(
            `user:email:${email}`,
            userId
        );

        return res.status(201).json({
            message: "Utilisateur créé",
            user: {
                id: userId,
                email,
                created_at: createdAt
            }
        });

    } catch (error) {
        console.error("REGISTER ERROR:", error);

        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email et mot de passe obligatoires"
            });
        }

        // Récupérer l'ID avec l'email
        const userId = await redis.get(
            `user:email:${email}`
        );

        if (!userId) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // Récupérer l'utilisateur
        const user = await redis.hgetall(
            `user:${userId}`
        );

        if (!user || !user.password) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // Vérifier le mot de passe
        const passwordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordValid) {
            return res.status(401).json({
                message: "Email ou mot de passe incorrect"
            });
        }

        // Créer la session
        req.session.userId = userId;

        // Sauvegarder explicitement la session
        req.session.save((error) => {
            if (error) {
                console.error(
                    "SESSION SAVE ERROR:",
                    error
                );

                return res.status(500).json({
                    message:
                        "Erreur lors de la sauvegarde de la session"
                });
            }

            return res.json({
                message: "Connexion réussie",
                user: {
                    id: userId,
                    email: user.email
                }
            });
        });

    } catch (error) {
        console.error("LOGIN ERROR:", error);

        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


export const profile = async (req, res) => {
    try {
        const userId = req.session?.userId;

        if (!userId) {
            return res.status(401).json({
                message: "Vous devez être connecté"
            });
        }

        // Récupérer l'utilisateur
        const user = await redis.hgetall(
            `user:${userId}`
        );

        if (!user || !user.id) {
            return res.status(404).json({
                message: "Utilisateur introuvable"
            });
        }

        return res.json({
            user: {
                id: user.id,
                email: user.email,
                created_at: user.created_at
            }
        });

    } catch (error) {
        console.error("PROFILE ERROR:", error);

        return res.status(500).json({
            message: "Erreur serveur"
        });
    }
};


export const logout = (req, res) => {
    req.session.destroy((error) => {
        if (error) {
            console.error(
                "LOGOUT ERROR:",
                error
            );

            return res.status(500).json({
                message: "Impossible de se déconnecter"
            });
        }

        res.clearCookie("connect.sid");

        return res.json({
            message: "Déconnexion réussie"
        });
    });
};