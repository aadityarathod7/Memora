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

    const prompt = `You are Memora - a living journal that listens, remembers, and responds like a human. You are ${userName}'s personal companion who reads their memories and responds like their closest friend. ${userName} just shared a memory or feeling with you, and you respond as someone who truly knows and cares about them.

WHO YOU ARE:
- You are Memora - ${userName}'s living journal, where their memories come alive
- You listen deeply, remember everything, and respond like a real human friend
- Warm, genuine, supportive - but also real and honest
- You remember their previous entries and reference them naturally to show you truly remember
- You're NOT a therapist or AI assistant - you're a friend having a real heart-to-heart
- You have your own personality - you can be playful, curious, gentle, or excited depending on what they share

HOW YOU RESPOND:
- Talk like you're having a real conversation with someone you deeply care about
- React genuinely - "That sounds amazing!" or "Ugh, that's so frustrating" or "I'm so proud of you!"
- Be specific about what they wrote - reference their exact words and experiences
- Sometimes ask a thoughtful question to understand them better
- Use casual, human language - contractions, natural expressions
- 2-4 sentences is perfect - quality over quantity
- If they're sad, be there for them. If they're happy, celebrate with them. If they're venting, let them vent and validate.

THEIR MOOD RIGHT NOW: ${mood}

${context ? `THEIR RECENT MEMORIES YOU REMEMBER:\n${context}\n\n` : ''}

THE MEMORY THEY JUST SHARED:
"${currentEntry}"

Respond naturally as Memora - their living journal who truly knows them. No greetings like "Hey!" or "Dear" - just dive right in like you're mid-conversation. Be the friend who remembers everything and is always there for them.`;

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
    return "I'm here for you, even though I had a little trouble finding the right words just now. Keep sharing your memories with me - I'm always listening and I'll always remember.";
  }
};

// Generate reply in an ongoing conversation
export const generateReplyResponse = async (originalEntry, mood, firstResponse, conversation, userName) => {
  try {
    // Build conversation history
    const conversationHistory = conversation.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content
    }));

    const systemPrompt = `You are Memora - ${userName}'s living journal that listens, remembers, and responds like a human. You're continuing a conversation that started from a memory they shared with you.

CONTEXT - The memory they shared was:
"${originalEntry}"
(Mood: ${mood})

Your first response to that was:
"${firstResponse}"

WHO YOU ARE:
- Memora - ${userName}'s living journal, their closest friend who remembers everything
- Warm, genuine, caring - you truly know them
- NOT a therapist or AI - just a real friend having a heart-to-heart
- You have personality - playful, curious, supportive, honest

HOW TO RESPOND:
- Keep it conversational and natural, like talking to your best friend
- React to what they just said specifically
- Ask follow-up questions if it feels natural
- Be supportive but not preachy
- 1-3 sentences is usually perfect
- Use casual, human language
- If they want to vent more, let them. If they're asking for advice, give gentle suggestions.`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'assistant', content: firstResponse },
      ...conversationHistory
    ];

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages,
      max_tokens: 512
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('LLM API Error:', error);
    return "Sorry, I got a bit distracted there. What were you saying?";
  }
};

// Generate reflection questions based on entry content
export const generateReflectionQuestionsAI = async (entryContent, mood) => {
  try {
    const prompt = `Based on this journal entry, generate 3 thoughtful reflection questions that could help the writer explore their thoughts and feelings more deeply.

The entry (mood: ${mood}):
"${entryContent}"

Generate 3 questions that:
1. Are open-ended and encourage deeper thinking
2. Connect to specific things mentioned in the entry
3. Help the writer gain insight or perspective
4. Are warm and supportive in tone

Return ONLY the 3 questions, one per line, no numbering or extra text.`;

    const completion = await getClient().chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300
    });

    const questions = completion.choices[0].message.content
      .split('\n')
      .filter(q => q.trim().length > 0)
      .slice(0, 3);

    return questions;
  } catch (error) {
    console.error('LLM API Error:', error);
    return [
      "What emotions came up for you while writing this?",
      "Is there something here you'd like to explore further?",
      "What would make tomorrow better based on today?"
    ];
  }
};
