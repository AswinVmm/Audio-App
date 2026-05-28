import { useState } from "react";
import { createClient, processLock } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Signup() {
    const [email, setEmail] = useState("");
    const navigate = useNavigate();

    const handleSignup = async () => {
        const { error } = await supabase.auth.signInWithOtp({
            email,
            options: {
                emailRedirectTo: import.meta.env.VITE_FRONTEND_URL + "/dashboard",
            },
        });

        if (error) {
            alert(error.message);
        } else {
            alert("Signup successful! Check your email.");
            navigate("/"); // go to login page
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl mb-4">Signup</h1>

            <input
                type="email"
                placeholder="Enter email"
                className="border p-2 mb-4"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <button
                onClick={handleSignup}
                className="bg-green-500 text-white px-4 py-2"
            >
                Signup
            </button>

            <p className="mt-4">
                Already have an account?{" "}
                <button onClick={() => navigate("/")}>Login</button>
            </p>
        </div>
    );
}