import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export default function Login() {
    const handleLogin = async () => {
        await supabase.auth.signInWithOtp({
            email: "user@email.com",
        });
    };

    return (
        <div>
            <h1>Login</h1>
            <button onClick={handleLogin}>Login with Email</button>
        </div>
    );
}