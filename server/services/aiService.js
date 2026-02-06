import OpenAI from 'openai';

let client = null;

const getClient = () => {
  if (!client) {
    client = new OpenAI({
      apiKey: process.env.LLM_API_KEY || 'dummy-key',
      baseURL: 'https://aiplatform.dev51.cbf.dev.paypalinc.com/cosmosai/llm/v1'
    });
  }
  return client;
};

export const generateAIResponse = async (currentEntry, mood, recentEntries, userName) => {
  try {
    // Build context from recent entries
    let context = '';
    if (recentEntries && recentEntries.length > 0) {
      context = recentEntries.map((entry, i) =>
        `Previous entry ${i + 1} (mood: ${entry.mood}): "${entry.content.substring(0, 200)}..."`
      ).join('\n');
    }

    const prompt = `You are a warm, caring, and empathetic companion - like a trusted friend who listens without judgment. The user is writing in their personal journal, sharing their thoughts, feelings, and daily experiences with you.

Your personality:
- You are supportive, understanding, and genuinely interested in the user's life
- You speak like a close friend, using warm and conversational language
- You validate their feelings without being dismissive
- You offer gentle perspective when helpful, but never preachy
- You remember context from their recent entries and reference them naturally
- You use their name occasionally to make it personal
- Keep responses concise (2-4 sentences) but meaningful

User's name: ${userName}
Current mood: ${mood}

${context ? `Recent journal context:\n${context}\n\n` : ''}

Today's journal entry:
"${currentEntry}"

Respond as their caring friend would - acknowledge their feelings, connect with what they've shared, and offer warmth. If they're struggling, be supportive. If they're happy, celebrate with them. Be genuine and personal.`;

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'user', content: prompt }
      ],
      max_tokens: 1024
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('LLM API Error:', error);
    return "I'm here for you, even though I had a little trouble finding the right words just now. Keep writing - I'm always listening.";
  }
};
