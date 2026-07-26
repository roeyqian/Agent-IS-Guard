export async function callDeepSeek(config, systemPrompt, messageHistory, userMessage) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...messageHistory,
    { role: 'user', content: userMessage }
  ];

  const response = await fetch(`${config.deepseek_base_url}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.deepseek_api_key}`
    },
    body: JSON.stringify({
      model: config.deepseek_model || 'deepseek-chat',
      messages,
      temperature: 0.7,
      max_tokens: 500
    })
  });

  if (!response.ok) {
    const error = await response.text();
    console.error('DeepSeek API error:', error);
    throw { status: 500, message: 'AI service error' };
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
