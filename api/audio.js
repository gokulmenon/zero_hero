export default async function handler(req, res) {
  // 1. MUST BE A GET REQUEST FOR CACHING
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed. Please use GET.' });
  }

  // Extract the number name from the URL
  const { name } = req.query;
  if (!name) return res.status(400).json({ error: 'Missing name parameter' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Missing API Key' });

  // Helper function to call the Gemini API
  const generateSpeech = async (promptText) => {
    const payload = {
      contents: [{ role: "user", parts: [{ text: promptText }] }],
      generationConfig: {
        responseModalities: ["AUDIO"],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
      },
      model: "gemini-2.5-flash-preview-tts"
    };

    const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return r.json();
  };

  try {
    // Generate the audio
    let data = await generateSpeech(name);

    // SILENT FALLBACK: If Google rejects the phrasing, try a stricter script format
    if (data.candidates && data.candidates[0].finishReason === 'OTHER') {
      console.warn(`Prompt rejected for ${name}. Falling back to strict script format.`);
      data = await generateSpeech(`Speaker: ${name}`);
    }

    // CACHE PROTECTION: If it still fails, return a 502 so Vercel does not cache the error
    if (data.candidates && data.candidates[0].finishReason === 'OTHER') {
      return res.status(502).json({ error: 'Model rejected prompt (OTHER)' });
    }
    if (!data.candidates || !data.candidates[0].content) {
      return res.status(500).json({ error: 'Invalid audio payload' });
    }

    // Success! Safe to cache for a year.
    res.setHeader('Cache-Control', 'public, s-maxage=31536000, immutable');
    return res.status(200).json(data);

  } catch (error) {
    console.error("Backend Error:", error);
    return res.status(500).json({ error: 'Failed to generate audio' });
  }
}
