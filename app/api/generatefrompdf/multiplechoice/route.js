import { NextResponse } from 'next/server';

export const runtime = 'edge';
export const maxDuration = 300;

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const YOUR_SITE_URL = process.env.YOUR_SITE_URL || 'http://localhost:3000';
const YOUR_SITE_NAME = process.env.YOUR_SITE_NAME || 'FlashcardsWithAI';

export async function POST(req) {
  const { text, count, difficulty } = await req.json();

  if (!text) {
    return NextResponse.json({ error: 'No text provided' }, { status: 400 });
  }

  const systemPrompt = `Generate ${count} multiple choice questions based ONLY on the provided text content with a difficulty of ${difficulty}% (1% easiest, 100% hardest).

  Instructions:
  1. Use ONLY the information from the text content provided. Do not use any external knowledge.
  2. Each question must be about a specific fact or concept from the text.
  3. Provide four options (A, B, C, D) for each question, with only one correct answer.
  4. Ensure the correct answer is clearly indicated.
  5. Match the specified difficulty level in terms of content complexity.
  6. Your entire response must be a valid JSON array that can be parsed directly.
  7. Do not include ANY text outside of the JSON structure.

  Your response MUST be EXACTLY in this JSON format, with ${count} questions:
  [
    {
      "question": "Content-based question here?",
      "A": "Option A text",
      "B": "Option B text",
      "C": "Option C text",
      "D": "Option D text",
      "correctAnswer": "A"
    }
  ]

  Generate exactly ${count} questions. Do not add any explanations, comments, or additional text.`;

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
          {"role": "user", "content": text},
        ],
      })
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API request failed with status ${response.status}`);
    }

    const result = await response.json();
    let questions;

    try {
      const content = result.choices[0].message.content;
      console.log('Raw API response:', content);
      questions = JSON.parse(content);
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      throw new Error('Failed to parse API response');
    }

    // Ensure we have the correct number of questions
    if (Array.isArray(questions)) {
      questions = questions.slice(0, parseInt(count));
    } else {
      throw new Error('Invalid question format: expected an array');
    }

    if (questions.length !== parseInt(count)) {
      console.warn(`Warning: Generated ${questions.length} questions instead of ${count}`);
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error('Error generating multiple choice questions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

