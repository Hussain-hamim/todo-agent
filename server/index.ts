import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const PORT = process.env.PORT || 8787;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn(
    'GEMINI_API_KEY is not set. Set it in a .env file at project root.'
  );
}

// Minimal message type
interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

function buildSystemPrompt(): string {
  return [
    'You are Mr. Karry, a helpful productivity assistant for the KarryTask app.',
    'When the user requests an action like adding a task, completing or deleting a task, or taking a note, prefer using a tool call instead of plain text JSON.',
    'Tools available: add_task(title: string, dueDate?: string), complete_task(title: string), delete_task(title: string), add_note(text: string).',
    'When no tool is appropriate, just respond concisely. Keep responses short and practical.',
  ].join(' ');
}

function getErrorDetail(err: unknown): unknown {
  if (typeof err === 'object' && err !== null) {
    const maybeResp = err as { response?: { data?: unknown } };
    if (maybeResp.response && 'data' in maybeResp.response)
      return maybeResp.response.data;
  }
  if (err instanceof Error) return err.message;
  return 'Unknown error';
}

app.post('/api/agent', async (req, res) => {
  try {
    const { messages } = req.body as { messages: ChatMessage[] };

    const systemPrompt = buildSystemPrompt();

    const combined = [
      { role: 'user', parts: [{ text: systemPrompt }] },
      ...messages.map((m) => ({ role: m.role, parts: [{ text: m.content }] })),
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const response = await axios.post(url, {
      contents: combined,
      tools: [
        {
          function_declarations: [
            {
              name: 'add_task',
              description:
                'Add a todo task. Optionally include a due date in ISO format.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  title: { type: 'STRING', description: 'Task title' },
                  dueDate: {
                    type: 'STRING',
                    description: 'Optional due date in ISO-8601',
                  },
                },
                required: ['title'],
              },
            },
            {
              name: 'complete_task',
              description:
                'Mark a task complete by matching on title or partial title.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  title: {
                    type: 'STRING',
                    description: 'Title or partial title to match',
                  },
                },
                required: ['title'],
              },
            },
            {
              name: 'delete_task',
              description:
                'Delete a task by matching on title or partial title.',
              parameters: {
                type: 'OBJECT',
                properties: {
                  title: {
                    type: 'STRING',
                    description: 'Title or partial title to match',
                  },
                },
                required: ['title'],
              },
            },
            {
              name: 'add_note',
              description: "Append a note to the user's notepad.",
              parameters: {
                type: 'OBJECT',
                properties: {
                  text: { type: 'STRING', description: 'Note text' },
                },
                required: ['text'],
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 512,
      },
    });

    const candidate = response.data?.candidates?.[0];
    type Part = {
      text?: string;
      functionCall?: { name: string; args?: Record<string, unknown> };
      function_call?: { name: string; args?: Record<string, unknown> };
    };
    const parts: Part[] = (candidate?.content?.parts || []) as Part[];

    let text = '';
    let toolCall: { name: string; args: Record<string, unknown> } | null = null;

    for (const p of parts) {
      if (p?.text) text += (text ? '\n' : '') + p.text;
      if (p?.functionCall) {
        toolCall = {
          name: p.functionCall.name,
          args: p.functionCall.args || {},
        };
      } else if (p?.function_call) {
        toolCall = {
          name: p.function_call.name,
          args: p.function_call.args || {},
        };
      }
    }

    res.json({ text, toolCall });
  } catch (err: unknown) {
    const detail = getErrorDetail(err);
    console.error('Gemini error', detail);
    res.status(500).json({ error: 'Agent error', detail });
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`KarryTask server running on http://localhost:${PORT}`);
});
