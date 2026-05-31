import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Login() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleLogin = async () => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: import.meta.env.VITE_FRONTEND_URL + "/dashboard",
            },
        });

        if (error) {
            alert(error.message);
        } else {
            alert("Check your email for login link!");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="border-2 flex flex-col border-gray-300 p-4 rounded shadow">
                <h1 className="text-2xl mb-4">Login</h1>

                <input
                    type="email"
                    placeholder="Enter email"
                    className="border p-2 mb-4"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={handleLogin}
                    className="bg-blue-500 rounded-4xl text-white px-4 py-2"
                >
                    Login
                </button>

                <p className="mt-4">
                    Don't have an account?{" "}
                    <button className="bg-blue-500 text-white px-4 py-2 rounded-4xl" onClick={() => navigate("/signup")}>Signup</button>
                </p>
            </div>
        </div>
    );
}
