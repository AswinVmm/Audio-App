import React, { useState, useEffect } from 'react'
// declare process for frontend TypeScript to avoid "Cannot find name 'process'" errors
declare const process: { env: { [key: string]: string | undefined } };
import axios from 'axios'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

function History() {
    const [items, setItems] = useState<any[]>([]);

    const fetchHistory = async () => {
        const session = await supabase.auth.getSession();

        const res = await axios.get(import.meta.env.VITE_BACKEND_URL + '/transcriptions', {
            headers: {
                Authorization: `Bearer ${session.data.session?.access_token}`,
            },
        });

        setItems(res.data);
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    return (
        <div>history
            {items.map((item) => (
                <div key={item.id}>
                    <audio controls src={item.file_url}></audio>
                    <p>{item.transcription}</p>
                </div>
            ))}
        </div>
    )
}

export default History