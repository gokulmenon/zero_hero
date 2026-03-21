export default async function handler(req, res) {
  // 1. MUST BE A GET REQUEST FOR CACHING
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use GET.' });
  }

  // Extract variables from the URL query string
  const { zeros, name } = req.query;
  if (!zeros || !name) {
    return res.status(400).json({ error: 'Missing zeros or name parameters' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  // 2. Build the prompt dynamically on the server
  const promptText = `Tell me a fun, easy-to-understand fact or analogy about the number "${name}" (10^${zeros}). If it's a huge number, compare it to atoms in the universe or something similar. Keep it very short (max 2 sentences) and suitable for a student.`;

  const payload = {
    contents: [{ parts: [{ text: promptText }] }]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Google API Error' });
    }

    // 3. THE MAGIC LINE: Cache this specific fact for 1 year
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, immutable');
    
    return res.status(200).json(data);
  } catch (error) {
    console.error("Fact Generation Error:", error);
    return res.status(500).json({ error: 'Failed to generate fact' });
  }
}
