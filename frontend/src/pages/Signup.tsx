// import { useState } from "react";
// import { createClient, processLock } from "@supabase/supabase-js";
// import { useNavigate } from "react-router-dom";

// const supabase = createClient(
//     import.meta.env.VITE_SUPABASE_URL,
//     import.meta.env.VITE_SUPABASE_ANON_KEY
// );

// export default function Signup() {
//     const [email, setEmail] = useState("");
//     const navigate = useNavigate();

//     const handleSignup = async () => {
//         const { error } = await supabase.auth.signInWithOtp({
//             email,
//             options: {
//                 emailRedirectTo: import.meta.env.VITE_FRONTEND_URL + "/dashboard",
//             },
//         });

//         if (error) {
//             alert(error.message);
//         } else {
//             alert("Signup successful! Check your email.");
//             navigate("/"); // go to login page
//         }
//     };

//     return (
//         <div className="flex flex-col items-center justify-center min-h-screen">
//             <h1 className="text-2xl mb-4">Signup</h1>

//             <input
//                 type="email"
//                 placeholder="Enter email"
//                 className="border p-2 mb-4"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//             />

//             <button
//                 onClick={handleSignup}
//                 className="bg-green-500 text-white px-4 py-2"
//             >
//                 Signup
//             </button>

//             <p className="mt-4">
//                 Already have an account?{" "}
//                 <button onClick={() => navigate("/")}>Login</button>
//             </p>
//         </div>
//     );
// }

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
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

        if (error) alert(error.message);
        else {
            alert("Signup successful! Check your email.");
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-400 to-blue-500">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <h1 className="text-3xl font-bold text-center mb-6">Create Account 🚀</h1>

                <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-green-400"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <button
                    onClick={handleSignup}
                    className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition"
                >
                    Sign Up
                </button>

                <p className="mt-4 text-center text-gray-600">
                    Already have an account?{" "}
                    <span
                        onClick={() => navigate("/")}
                        className="text-green-600 cursor-pointer font-semibold"
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
}
