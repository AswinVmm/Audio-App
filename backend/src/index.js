import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import { createClient } from "@supabase/supabase-js";

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
        const audioPath = req.file.path;

        const audioData = fs.readFileSync(audioPath);

        const response = await axios.post(
            "https://api.deepgram.com/v1/listen",
            audioData,
            {
                headers: {
                    Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
                    "Content-Type": "audio/wav",
                },
            }
        );

        const transcript =
            response.data.results.channels[0].alternatives[0].transcript;

        const { data, error } = await supabase.from("transcriptions").insert([
            {
                file_url: req.file.filename,
                transcription: transcript,
            },
        ]);

        if (error) {
            console.error("Supabase error:", error);
        }

        res.json({ transcript });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error processing audio");
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));