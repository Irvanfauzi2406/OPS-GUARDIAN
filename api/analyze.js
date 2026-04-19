export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end();

  const { prompt } = req.body;

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`  // ← Fix: typo + backtick
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 500              // ← Fix: tambah koma di sini
      })
    });

    const data = await response.json();
    
    // Tambahkan error handling
    if (!response.ok) {
      console.error("Groq API Error:", data);
      return res.status(response.status).json({ error: data.error?.message || "API Error" });
    }
    
    res.status(200).json(data);
  } catch (error) {
    console.error("Server Error:", error);
    res.status(500).json({ error: error.message });
  }
}
