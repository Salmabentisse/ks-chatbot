
// @ts-nocheck

import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export const maxDuration = 30;

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export async function POST(req: Request) {
  try {
    const { messages } = (await req.json()) as { messages: Message[] };

    const history = messages
      .map((m) => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n');

    const result = await generateText({
      // ⬇⬇⬇ ICI : modèle PRO, plus de "gemini-1.5-flash" ⬇⬇⬇
      model: google('gemini-pro'),
      prompt: history,
      maxTokens: 512,
    });

    return Response.json({ reply: result.text }, { status: 200 });
  } catch (err: any) {
    console.error('[api/chat] Erreur Gemini :', err);

    const message =
      err && typeof err.message === 'string'
        ? err.message
        : 'Erreur inconnue côté LLM';

    return Response.json(
      {
        reply:
          "Je n'ai pas pu appeler correctement le modèle Gemini. Détail de l'erreur : " +
          message,
      },
      { status: 200 },
    );
  }
}
