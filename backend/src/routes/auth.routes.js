app.get("/transcriptions", async (req, res) => {
    const user = getUser(req);

    const { data, error } = await supabase
        .from("transcriptions")
        .select("*")
        .eq("user_id", user.sub)
        .order("created_at", { ascending: false });

    res.json(data);
});