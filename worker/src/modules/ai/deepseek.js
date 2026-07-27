export async function callDeepSeek(config, systemPrompt, messageHistory, userMessage) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...messageHistory,
    { role: 'user', content: userMessage }
  ];

  const data = await postDeepSeek(config, {
    model: config.deepseek_model || 'deepseek-chat',
    messages,
    temperature: 0.7,
    max_tokens: 500
  });

  return data.choices[0].message.content;
}

export async function testDeepSeekConnection(config) {
  const data = await postDeepSeek(config, {
    model: config.deepseek_model || 'deepseek-chat',
    messages: [
      { role: 'system', content: 'Reply with exactly: ok' },
      { role: 'user', content: 'ping' }
    ],
    temperature: 0,
    max_tokens: 8
  });

  return {
    ok: true,
    model: data.model || config.deepseek_model || 'deepseek-chat',
    response: data.choices?.[0]?.message?.content || ''
  };
}

async function postDeepSeek(config, payload) {
  const response = await fetch(`${normalizeBaseUrl(config.deepseek_base_url)}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.deepseek_api_key}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const error = await readProviderError(response);
    console.error('DeepSeek API error:', error);
    throw { status: 502, message: error || 'AI service error' };
  }

  const data = await response.json();
  if (!data?.choices?.[0]?.message) {
    throw { status: 502, message: 'AI service returned an unexpected response' };
  }

  return data;
}

function normalizeBaseUrl(value) {
  return String(value || 'https://api.deepseek.com').replace(/\/+$/, '');
}

async function readProviderError(response) {
  const text = await response.text();
  if (!text) return `AI service returned HTTP ${response.status}`;

  try {
    const data = JSON.parse(text);
    const message = data?.error?.message || data?.message || text;
    return `AI service returned HTTP ${response.status}: ${String(message).slice(0, 240)}`;
  } catch {
    return `AI service returned HTTP ${response.status}: ${text.slice(0, 240)}`;
  }
}
