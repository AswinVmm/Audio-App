import { useState } from "react";
import type { ChangeEvent } from "react";
import axios from "axios";
import { createClient } from "@supabase/supabase-js";

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  const handleLogin = async () => {
    await supabase.auth.signInWithOtp({
      email: "user@email.com",
    });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select an audio file");
      return;
    }

    const formData = new FormData();
    formData.append("audio", file);

    try {
      setLoading(true);
      const session = await supabase.auth.getSession();

      const res = await axios.post(
        "http://localhost:5000/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${session.data.session?.access_token}`,
          },
        }
      );

      setText(res.data.transcript);
    } catch (error) {
      console.error(error);
      alert("Error uploading file");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-6">
      <h1 className="text-3xl font-bold mb-6">🎤 Audio to Text</h1>

      <div className="bg-white shadow-md rounded-xl p-6 w-full max-w-md">
        <input
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          className="mb-4"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
        >
          {loading ? "Processing..." : "Upload & Transcribe"}
        </button>

        {text && (
          <div className="mt-4 p-3 bg-gray-200 rounded">
            <h2 className="font-semibold mb-2">Transcription:</h2>
            <p>{text}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;