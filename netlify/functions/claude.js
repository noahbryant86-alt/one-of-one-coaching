exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };
  try {
    const body = JSON.parse(event.body);
    const { vision, why, being, missions, wentWell, learned, better, score, complete } = body;

    const missionText = (missions || []).map(function(m) {
      return (m.done ? '[Done] ' : '[Not done] ') + (m.text || '');
    }).join('\n');

    const prompt = `You are a deeply perceptive one-to-one mindset coach. You are reading an evening reflection from one of your private coaching students. This is their daily check-in. Read everything carefully. Respond to their actual words — not generically.

THEIR VISION: ${vision}
THEIR WHY: ${why}

WHO THEY SAID THEY WERE BEING TODAY: ${being}

TODAY'S MISSIONS:
${missionText}

MISSIONS COMPLETE: ${complete ? 'Yes' : 'No'}
DAY SCORE: ${score}/10

WHAT WENT WELL TODAY:
${wentWell}

WHAT THEY LEARNED TODAY:
${learned}

WHAT COULD BE BETTER TOMORROW:
${better}

Write a personal evening reflection in four parts. No headers or labels — write it as one flowing piece. Second person. Warm, direct, honest. 200-280 words. Make every sentence feel like it was written specifically for them.

PART 1 — THE WIN
Acknowledge what went well today and go one level deeper. What does it reveal about who they are becoming? Don't just validate — illuminate. Make them feel the significance of something they might have glossed over.

PART 2 — THE LEARNING
Take what they said they learned and reflect it back with more depth. What is this insight really pointing to? How does it connect to their vision or their identity work? Make it feel like a revelation not a summary.

PART 3 — TOMORROW'S EDGE
Take what they said could be better and turn it from a self-criticism into a specific direction for tomorrow. What is the one thing they should do differently? Make it concrete and actionable — something they can actually hold in mind when they wake up.

PART 4 — THE THREAD BACK
Close by connecting today — however it went — back to their vision and why. Use their actual words. Remind them that the day they just lived, with all its wins and gaps, is part of the larger thing they are building. Leave them with one sentence that makes tomorrow feel important.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 800,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (data.error) return { statusCode: 500, headers, body: JSON.stringify({ error: data.error.message }) };
    return { statusCode: 200, headers, body: JSON.stringify({ reflection: data.content[0].text }) };

  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
