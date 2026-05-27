import express from "express";
import { getUser } from "../middleware/auth.js";

export default function (supabase) {
    const router = express.Router();

    router.get("/transcriptions", async (req, res) => {
        const user = await getUser(req, supabase);

        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        const { data, error } = await supabase
            .from("transcriptions")
            .select("*")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false });

        if (error) {
            return res.status(500).json(error);
        }

        res.json(data);
    });

    return router;
}