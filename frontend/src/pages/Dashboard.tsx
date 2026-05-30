import { useState, useEffect, useRef } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

function App() {
    const [file, setFile] = useState<File | null>(null);
    const [text, setText] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [recording, setRecording] = useState<boolean>(false);
    const [history, setHistory] = useState<any[]>([]);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const navigate = useNavigate();

    const supabase = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY
    );

    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            if (!data.session) navigate("/");
            else fetchHistory();
        });
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/");
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
            setFile(e.target.files[0]);
        }
    };

    const fetchHistory = async () => {
        try {
            const session = await supabase.auth.getSession();

            const res = await axios.get(
                backendUrl + "/api/transcriptions",
                {
                    headers: {
                        Authorization: `Bearer ${session.data.session?.access_token}`,
                    },
                }
            );

            setHistory(res.data);
        } catch (err) {
            console.error("History error:", err);
        }
    };

    // 🎤 START RECORDING
    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;

        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorder.start();
        setRecording(true);
    };

    // 🛑 STOP RECORDING + SEND
    const stopRecording = async () => {
        mediaRecorderRef.current?.stop();

        mediaRecorderRef.current!.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, {
                type: "audio/webm",
            });

            const recordedFile = new File([audioBlob], "recording.webm", {
                type: "audio/webm",
            });

            await uploadAudio(recordedFile);
        };

        setRecording(false);
    };

    // 🔁 COMMON UPLOAD FUNCTION (FILE + RECORDING)
    const uploadAudio = async (audioFile: File) => {
        const formData = new FormData();
        formData.append("audio", audioFile);

        try {
            setLoading(true);

            const session = await supabase.auth.getSession();
            await fetchHistory();
            const res = await axios.post(
                backendUrl + "/upload",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${session.data.session?.access_token}`,
                    },
                }
            );

            setText(res.data.transcript);
        } catch (err: any) {
            console.error(err.response?.data || err.message);
            alert("Error uploading audio");
        } finally {
            setLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!file) return alert("Select a file");
        await uploadAudio(file);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">

            <div className="flex justify-between w-full max-w-md mb-4">
                <h1 className="text-2xl font-bold">🎤 Audio to Text</h1>
                <button onClick={handleLogout}>Logout</button>
            </div>

            <div className="bg-white p-6 rounded shadow w-full max-w-md">

                {/* 📁 Upload */}
                <input type="file" accept="audio/*" onChange={handleFileChange} />
                <button onClick={handleUpload} disabled={loading}>
                    Upload & Transcribe
                </button>

                <hr className="my-4" />

                {/* 🎙️ Recorder */}
                {!recording ? (
                    <button onClick={startRecording} className="bg-green-500 text-white px-4 py-2">
                        Start Recording
                    </button>
                ) : (
                    <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2">
                        Stop Recording
                    </button>
                )}

                {loading && <p>Processing...</p>}

                {text && (
                    <div className="mt-4 p-3 bg-gray-200 rounded">
                        <h2>Transcription:</h2>
                        <p>{text}</p>
                    </div>
                )}

                {history.length > 0 && (
                    <div className="mt-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-2">🕘 History</h2>

                        {history.map((item) => (
                            <div key={item.id} className="bg-white p-3 mb-3 rounded shadow">
                                <audio controls src={item.file_url}></audio>
                                <p className="mt-2">{item.transcription}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;