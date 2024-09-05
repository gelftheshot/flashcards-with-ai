import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || 'FlashcardsWithAI';

export async function POST(req) {
  const { prompt, count, difficulty } = await req.json();
  const systemPrompt = `Generate ${count} multiple-choice questions on the given topic with a difficulty of ${difficulty}% (1% easiest, 100% hardest).

Instructions:
1. Each question should focus on a key concept within the topic.
2. Provide four options (A, B, C, D) for each question.
3. Ensure only one option is correct.
4. Match the specified difficulty level.
5. Do not include any text outside of the JSON structure.
6. Ensure the response is valid JSON and can be parsed directly.

Format your response ONLY as a JSON array of objects with this structure:
[
  {
    "question": "Question text here?",
    "correctAnswer": "A",
    "A": "Option A text",
    "B": "Option B text",
    "C": "Option C text",
    "D": "Option D text"
  }
]

Generate exactly ${count} questions in this format. Do not include any other text or explanations.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": YOUR_SITE_URL,
        "X-Title": YOUR_SITE_NAME,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": "meta-llama/llama-3.1-8b-instruct:free",
        "messages": [
          {"role": "system", "content": systemPrompt},
          {"role": "user", "content": prompt},
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const questions = JSON.parse(result.choices[0].message.content);

    if (!Array.isArray(questions) || questions.length !== count) {
      throw new Error('Invalid question format or count');
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating multiple choice questions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
