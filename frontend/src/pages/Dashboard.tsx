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
    const [showHistory, setShowHistory] = useState(false);

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

    const deleteTranscription = async (id: string) => {
        try {
            const token = (await supabase.auth.getSession()).data.session?.access_token;

            await axios.delete(`${backendUrl}/api/transcriptions/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            // 🔄 Refresh history after delete
            setHistory((prev) => prev.filter((item) => item.id !== id));

        } catch (err) {
            console.error(err);
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

            if (showHistory) {
                await fetchHistory();
            }

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

    // return (
    //     <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">

    //         <div className="flex justify-between w-full max-w-md mb-4">
    //             <h1 className="text-2xl font-bold">🎤 Audio to Text</h1>
    //             <button className="btn-danger" onClick={handleLogout}>Logout</button>
    //         </div>

    //         <div className="bg-white p-6 rounded shadow w-full max-w-md">

    //             {/* 📁 Upload */}
    //             <input type="file" accept="audio/*" onChange={handleFileChange} />
    //             <button onClick={handleUpload} disabled={loading}>
    //                 Upload & Transcribe
    //             </button>

    //             <hr className="my-4" />

    //             {/* 🎙️ Recorder */}
    //             {!recording ? (
    //                 <button onClick={startRecording} className="bg-green-500 text-white px-4 py-2">
    //                     Start Recording
    //                 </button>
    //             ) : (
    //                 <button onClick={stopRecording} className="bg-red-500 text-white px-4 py-2">
    //                     Stop Recording
    //                 </button>
    //             )}

    //             <button
    //                 onClick={async () => {
    //                     if (!showHistory) {
    //                         await fetchHistory(); // fetch only when opening
    //                     }
    //                     setShowHistory(!showHistory);
    //                 }}
    //                 className="bg-purple-500 text-white px-4 py-2 mt-4"
    //             >
    //                 {showHistory ? "Hide History" : "Show Previous Transcriptions"}
    //             </button>

    //             {loading && <p>Processing...</p>}

    //             {text && (
    //                 <div className="mt-4 p-3 bg-gray-200 rounded">
    //                     <h2>Transcription:</h2>
    //                     <p>{text}</p>
    //                 </div>
    //             )}

    //             {showHistory && history.length > 0 && (
    //                 <div className="mt-6 w-full max-w-md">
    //                     <h2 className="text-xl font-bold mb-2">🕘 History</h2>

    //                     {history.map((item) => (
    //                         <div key={item.id} className="border p-3 mt-2 flex justify-between items-center">
    //                             <div>
    //                                 <p className="font-semibold">{item.transcription}</p>
    //                             </div>

    //                             <button
    //                                 onClick={() => {
    //                                     if (confirm("Are you sure you want to delete this?")) {
    //                                         deleteTranscription(item.id);
    //                                     }
    //                                 }}
    //                                 className="bg-red-500 text-white px-3 py-1 rounded"
    //                             >
    //                                 Delete
    //                             </button>
    //                         </div>
    //                     ))}
    //                 </div>
    //             )}
    //         </div>
    //     </div>
    // );

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-100 to-gray-200 flex flex-col items-center p-6">

            {/* HEADER */}
            <div className="w-full max-w-3xl flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">🎤 Audio Transcriber</h1>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow transition"
                >
                    Logout
                </button>
            </div>

            {/* MAIN CARD */}
            <div className="bg-white w-full max-w-3xl p-8 rounded-2xl shadow-lg">

                {/* FILE UPLOAD */}
                <div className="mb-6">
                    <label className="block text-gray-600 mb-2 font-medium">
                        Upload Audio File
                    </label>

                    <input
                        type="file"
                        accept="audio/*"
                        onChange={handleFileChange}
                        className="w-full border p-2 rounded-lg"
                    />

                    <button
                        onClick={handleUpload}
                        disabled={loading}
                        className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:bg-gray-400"
                    >
                        Upload & Transcribe
                    </button>
                </div>

                <hr className="my-6" />

                {/* RECORDING */}
                <div className="flex gap-4">
                    {!recording ? (
                        <button
                            onClick={startRecording}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition"
                        >
                            🎙️ Start Recording
                        </button>
                    ) : (
                        <button
                            onClick={stopRecording}
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition"
                        >
                            ⏹ Stop Recording
                        </button>
                    )}

                    <button
                        onClick={async () => {
                            if (!showHistory) await fetchHistory();
                            setShowHistory(!showHistory);
                        }}
                        className="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition"
                    >
                        {showHistory ? "Hide History" : "View History"}
                    </button>
                </div>

                {/* LOADING */}
                {loading && (
                    <p className="text-blue-600 mt-4 animate-pulse">
                        Processing audio...
                    </p>
                )}

                {/* RESULT */}
                {text && (
                    <div className="mt-6 p-4 bg-gray-100 rounded-xl border">
                        <h2 className="font-semibold text-gray-700 mb-2">
                            Transcription
                        </h2>
                        <p className="text-gray-800 leading-relaxed">{text}</p>
                    </div>
                )}

                {/* HISTORY */}
                {showHistory && history.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-3 text-gray-800">
                            🕘 Previous Transcriptions
                        </h2>

                        <div className="space-y-3">
                            {history.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border hover:shadow-sm transition"
                                >
                                    <p className="text-gray-700 flex-1 pr-4">
                                        {item.transcription}
                                    </p>

                                    <button
                                        onClick={() => {
                                            if (confirm("Delete this transcription?")) {
                                                deleteTranscription(item.id);
                                            }
                                        }}
                                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                                    >
                                        Delete
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;