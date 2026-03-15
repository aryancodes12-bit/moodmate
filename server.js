require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

app.post('/api/chat', async (req, res) => {
  const apiKey = process.env.GROQ_API_KEY?.trim();

  if (!apiKey) {
    return res.status(500).json({ error: 'GROQ_API_KEY not set in .env file' });
  }

  try {
    const { system, userPrompt } = req.body;
    console.log('Calling Groq with model: llama3-8b-8192');

    const payload = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
    };

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Groq error response:', JSON.stringify(data, null, 2));
      return res.status(response.status).json(data);
    }

    console.log('Groq success!');
    res.json({ text: data.choices?.[0]?.message?.content || '' });

  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({ error: 'Failed to reach Groq API' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ MoodMate proxy server running at http://localhost:${PORT}`);
  console.log(`   React app should run at http://localhost:3000`);
});