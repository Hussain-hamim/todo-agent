import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAppStore } from '../store';
import { Send, ListTodo, StickyNote } from 'lucide-react';

export type ChatMessage = { role: 'user' | 'assistant'; content: string };

function extractAction(
  text: string
): { action?: string; title?: string; dueDate?: string; text?: string } | null {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    const obj = JSON.parse(jsonMatch[0]);
    if (typeof obj === 'object' && obj.action) return obj;
  } catch {
    return null;
  }
  return null;
}

export default function Agent() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello, I'm HussainAI. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const [noteDraft, setNoteDraft] = useState('');
  const { addTask, toggleTask, deleteTask, setNotes } = useAppStore();
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function runTool(
    toolCall: { name: string; args: Record<string, unknown> } | null
  ) {
    if (!toolCall) return false;
    const name = toolCall.name;
    const args = toolCall.args || {};

    if (name === 'add_task') {
      const title = String(args.title || '').trim();
      const dueDate = args.dueDate ? String(args.dueDate) : undefined;
      if (title) addTask(title, dueDate);
      return true;
    }
    if (name === 'complete_task') {
      const title = String(args.title || '').toLowerCase();
      if (title) {
        const t = useAppStore
          .getState()
          .tasks.find((x) => x.title.toLowerCase().includes(title));
        if (t) toggleTask(t.id);
      }
      return true;
    }
    if (name === 'delete_task') {
      const title = String(args.title || '').toLowerCase();
      if (title) {
        const t = useAppStore
          .getState()
          .tasks.find((x) => x.title.toLowerCase().includes(title));
        if (t) deleteTask(t.id);
      }
      return true;
    }
    if (name === 'add_note') {
      const text = String(args.text || '');
      if (text) setNotes((useAppStore.getState().notes || '') + '\n' + text);
      return true;
    }
    return false;
  }

  async function sendMessage() {
    const question = input.trim();
    if (!question) return;
    setInput('');
    const next: ChatMessage[] = [
      ...messages,
      { role: 'user', content: question } as ChatMessage,
    ];
    setMessages(next);

    try {
      const { data } = await axios.post('/api/agent', { messages: next });
      const text: string = data?.text ?? '';
      const toolCall: { name: string; args: Record<string, unknown> } | null =
        data?.toolCall || null;

      const executed = runTool(toolCall);
      if (!executed) {
        const detected = extractAction(text);
        if (detected?.action) {
          if (detected.action === 'add_task' && detected.title)
            addTask(detected.title, detected.dueDate);
          else if (detected.action === 'complete_task' && detected.title) {
            const t = useAppStore
              .getState()
              .tasks.find((x) =>
                x.title.toLowerCase().includes(detected.title!.toLowerCase())
              );
            if (t) toggleTask(t.id);
          } else if (detected.action === 'delete_task' && detected.title) {
            const t = useAppStore
              .getState()
              .tasks.find((x) =>
                x.title.toLowerCase().includes(detected.title!.toLowerCase())
              );
            if (t) deleteTask(t.id);
          } else if (detected.action === 'add_note' && detected.title) {
            setNotes(
              (useAppStore.getState().notes || '') + '\n' + detected.title
            );
          }
        }
      }

      const finalText = text || (executed ? 'Done.' : '');
      if (finalText)
        setMessages((m) => [...m, { role: 'assistant', content: finalText }]);
    } catch (err: unknown) {
      console.error(err);
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content: 'Sorry, I could not reach HussainAI right now.',
        },
      ]);
    }
  }

  function quickAddTask() {
    if (!input.trim()) return;
    addTask(input.trim());
    setMessages((m) => [
      ...m,
      { role: 'assistant', content: `Added task: ${input.trim()}` },
    ]);
    setInput('');
  }

  function quickAddNote() {
    if (!noteDraft.trim()) return;
    setNotes((useAppStore.getState().notes || '') + '\n' + noteDraft.trim());
    setMessages((m) => [...m, { role: 'assistant', content: 'Note added.' }]);
    setNoteDraft('');
  }

  async function ask(prompt: string) {
    setInput(prompt);
    await sendMessage();
  }

  return (
    <div className='card'>
      <div className='mb-3 flex items-center justify-between'>
        <div className='text-lg font-semibold'>Chat with HussainAI</div>
        <div className='flex gap-1'>
          <button className='btn' onClick={() => ask('List my tasks')}>
            Tasks
          </button>
          <button className='btn' onClick={() => ask('Summarize my notes')}>
            Summarize Notes
          </button>
          <button className='btn' onClick={() => ask('Prioritize my tasks')}>
            Prioritize
          </button>
        </div>
      </div>

      <div className='mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2'>
        <div className='flex items-center gap-2'>
          <input
            className='input'
            placeholder='Quick task: e.g., Book flights'
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className='btn'
            onClick={quickAddTask}
            aria-label='Add quick task'
          >
            <ListTodo size={16} />
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <input
            className='input'
            placeholder='Quick note'
            value={noteDraft}
            onChange={(e) => setNoteDraft(e.target.value)}
          />
          <button className='btn' onClick={quickAddNote} aria-label='Add note'>
            <StickyNote size={16} />
          </button>
        </div>
      </div>

      <div className='max-h-[50vh] overflow-y-auto space-y-2 pr-2'>
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === 'user' ? 'bg-white/20' : 'bg-black/20'
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className='mt-3 flex gap-2'>
        <input
          className='input'
          placeholder='Ask HussainAI to add tasks, set due dates, or summarize notes...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button className='btn' onClick={sendMessage} aria-label='Send message'>
          <Send size={16} />
        </button>
      </div>
      <div className='mt-2 text-xs text-white/50'>
        Tip: “Set due date for Book flights to tomorrow at 4pm” or “Rename task
        Buy milk to Buy groceries”.
      </div>
    </div>
  );
}
