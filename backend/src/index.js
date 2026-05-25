import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";
import { getUser } from "./middleware/auth.js";

dotenv.config();

const app = express();
app.use(cors());

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("audio"), async (req, res) => {
    try {
        const user = getUser(req);

        if (!user) {
            return res.status(401).send("Unauthorized");
        }

        const audioPath = req.file.path;
        const audioData = fs.readFileSync(audioPath);

        // 🎯 Send to Deepgram
        const response = await axios.post(
            "https://api.deepgram.com/v1/listen",
            audioData,
            {
                headers: {
                    Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                    "Content-Type": req.file.mimetype,
                },
            }
        );

        const transcript =
            response.data.results.channels[0].alternatives[0].transcript;

        // 📦 Upload to Supabase Storage
        const fileBuffer = fs.readFileSync(audioPath);
        const fileName = `${Date.now()}-${req.file.originalname}`;

        const { error: storageError } = await supabase.storage
            .from("audio-files")
            .upload(fileName, fileBuffer, {
                contentType: req.file.mimetype,
            });

        if (storageError) {
            console.error(storageError);
            return res.status(500).send("Storage upload failed");
        }

        const { data: publicUrlData } = supabase.storage
            .from("audio-files")
            .getPublicUrl(fileName);

        const fileUrl = publicUrlData.publicUrl;

        // 💾 Save in DB
        const { error } = await supabase.from("transcriptions").insert([
            {
                user_id: user.sub,
                file_url: fileUrl,
                transcription: transcript,
            },
        ]);

        if (error) {
            console.error(error);
        }

        res.json({ transcript });

    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing audio");
    }
});

app.get("/transcriptions", async (req, res) => {
    const user = getUser(req);

    if (!user) {
        return res.status(401).send("Unauthorized");
    }

    const { data, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq("user_id", user.sub)
        .order("created_at", { ascending: false });

    res.json(data);
});

app.listen(5000, () => {
    console.log("Server running on port 5000");
});