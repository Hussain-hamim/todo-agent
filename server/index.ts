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

// Very small local intent fallback for when Gemini is unavailable/blocked
function parseTimeToIso(message: string): string | undefined {
  const now = new Date();
  const lower = message.toLowerCase();
  const target = new Date(now);

  const timeMatch = lower.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  let hour: number | undefined;
  let minute: number | undefined;
  if (timeMatch) {
    hour = parseInt(timeMatch[1], 10);
    minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    const meridiem = timeMatch[3];
    if (meridiem) {
      if (meridiem === 'pm' && hour < 12) hour += 12;
      if (meridiem === 'am' && hour === 12) hour = 0;
    }
  }

  if (lower.includes('tomorrow')) {
    target.setDate(now.getDate() + 1);
  }

  if (hour !== undefined) target.setHours(hour, minute ?? 0, 0, 0);
  else target.setHours(17, 0, 0, 0);
  return target.toISOString();
}

function stripPhrases(s: string): string {
  return s
    .replace(/\bto\s+my\s+(to-?do|todo|task)\s+list\b/gi, '')
    .replace(/\bto\s+(my\s+)?list\b/gi, '')
    .replace(/\btoday\b/gi, '')
    .replace(/\btomorrow\b/gi, '')
    .replace(/\bat\s+\d{1,2}(:\d{2})?\s*(am|pm)?/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function localIntent(messages: ChatMessage[]): {
  text: string;
  toolCall: { name: string; args: Record<string, unknown> } | null;
} {
  const lastUser = [...messages].reverse().find((m) => m.role === 'user');
  const utterance = lastUser?.content || '';
  const lower = utterance.toLowerCase();

  // Add task
  if (/(^|\s)(add|create)\b/.test(lower) && /(task|to-?do|todo)/.test(lower)) {
    const dueDate = parseTimeToIso(utterance);
    let title = utterance.replace(/^(.*?)(add|create)\s+/i, '');
    title = stripPhrases(title);
    if (!title) title = 'New Task';
    return {
      text: 'Added task (local).',
      toolCall: { name: 'add_task', args: { title, dueDate } },
    };
  }

  // Complete task
  if (/(^|\s)(complete|finish|done|mark as done)\b/.test(lower)) {
    const title =
      stripPhrases(
        utterance.replace(/^(.*?)(complete|finish|done|mark as done)\s+/i, '')
      ) || 'task';
    return {
      text: 'Completed task (local).',
      toolCall: { name: 'complete_task', args: { title } },
    };
  }

  // Delete task
  if (/(^|\s)(delete|remove)\b/.test(lower)) {
    const title =
      stripPhrases(utterance.replace(/^(.*?)(delete|remove)\s+/i, '')) ||
      'task';
    return {
      text: 'Deleted task (local).',
      toolCall: { name: 'delete_task', args: { title } },
    };
  }

  // Note
  if (/(^|\s)(note|remember|write)\b/.test(lower)) {
    const text =
      stripPhrases(utterance.replace(/^(.*?)(note|remember|write)\s+/i, '')) ||
      utterance;
    return {
      text: 'Added note (local).',
      toolCall: { name: 'add_note', args: { text } },
    };
  }

  return {
    text: "I couldn't reach AI. No actionable intent detected.",
    toolCall: null,
  };
}

app.post('/api/agent', async (req, res) => {
  const { messages } = req.body as { messages: ChatMessage[] };
  try {
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
    const fallback = localIntent(messages);
    res.status(200).json(fallback);
  }
});

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`KarryTask server running on http://localhost:${PORT}`);
});
