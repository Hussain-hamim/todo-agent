import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { useAppStore } from '../store';
import { Send } from 'lucide-react';

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
      content: "Hello, I'm UnknownAi. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState('');
  const {
    addTask,
    toggleTask,
    deleteTask,
    setNotes,
    setDueDateByTitle,
    renameTaskByTitle,
    clearCompleted,
  } = useAppStore();
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

    switch (name) {
      case 'add_task': {
        const title = String(args.title || '').trim();
        const dueDate = args.dueDate ? String(args.dueDate) : undefined;
        if (title) addTask(title, dueDate);
        return true;
      }
      case 'complete_task': {
        const title = String(args.title || '').toLowerCase();
        if (title) {
          const t = useAppStore
            .getState()
            .tasks.find((x) => x.title.toLowerCase().includes(title));
          if (t) toggleTask(t.id);
        }
        return true;
      }
      case 'delete_task': {
        const title = String(args.title || '').toLowerCase();
        if (title) {
          const t = useAppStore
            .getState()
            .tasks.find((x) => x.title.toLowerCase().includes(title));
          if (t) deleteTask(t.id);
        }
        return true;
      }
      case 'add_note': {
        const text = String(args.text || '');
        if (text) setNotes((useAppStore.getState().notes || '') + '\n' + text);
        return true;
      }
      case 'list_tasks': {
        const summary = useAppStore
          .getState()
          .tasks.map(
            (t, i) =>
              `${i + 1}. ${t.title}${t.completed ? ' (done)' : ''}${
                t.dueDate
                  ? ` — due ${new Date(t.dueDate).toLocaleString()}`
                  : ''
              }`
          )
          .join('\n');
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: summary || 'No tasks yet.' },
        ]);
        return true;
      }
      case 'list_notes': {
        const content = (useAppStore.getState().notes || '').trim();
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: content || 'No notes yet.' },
        ]);
        return true;
      }
      case 'summarize_notes': {
        const content = (useAppStore.getState().notes || '').trim();
        if (!content) {
          setMessages((m) => [
            ...m,
            { role: 'assistant', content: 'No notes to summarize.' },
          ]);
          return true;
        }
        // Simple local summary fallback (can be replaced with model summarization later)
        const lines = content.split(/\n+/).filter(Boolean);
        const top = lines.slice(0, 5).join('\n');
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: `Summary (first items):\n${top}` },
        ]);
        return true;
      }
      case 'prioritize_tasks': {
        const sorted = [...useAppStore.getState().tasks].sort((a, b) => {
          const ad = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
          const bd = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
          return ad - bd;
        });
        const summary = sorted
          .map(
            (t, i) =>
              `${i + 1}. ${t.title}${t.completed ? ' (done)' : ''}${
                t.dueDate
                  ? ` — due ${new Date(t.dueDate).toLocaleString()}`
                  : ''
              }`
          )
          .join('\n');
        setMessages((m) => [
          ...m,
          { role: 'assistant', content: summary || 'No tasks yet.' },
        ]);
        return true;
      }
      case 'set_due_date': {
        const title = String(args.title || '');
        const dueDate = String(args.dueDate || '');
        const ok = title && dueDate ? setDueDateByTitle(title, dueDate) : false;
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: ok ? 'Due date set.' : 'Task not found.',
          },
        ]);
        return true;
      }
      case 'rename_task': {
        const title = String(args.title || '');
        const newTitle = String(args.newTitle || '');
        const ok =
          title && newTitle ? renameTaskByTitle(title, newTitle) : false;
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content: ok ? 'Task renamed.' : 'Task not found.',
          },
        ]);
        return true;
      }
      case 'clear_completed': {
        const n = clearCompleted();
        setMessages((m) => [
          ...m,
          {
            role: 'assistant',
            content:
              n > 0
                ? `Cleared ${n} completed task(s).`
                : 'No completed tasks to clear.',
          },
        ]);
        return true;
      }
      default:
        return false;
    }
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
      const { data } = await axios.post(
        'https://todo-agent-ltin.onrender.com/api/agent',
        { messages: next }
      );
      const text: string = data?.text ?? '';
      const toolCall: { name: string; args: Record<string, unknown> } | null =
        data?.toolCall || null;

      let executed = runTool(toolCall);
      if (!executed) {
        const detected = extractAction(text);
        if (detected?.action) {
          if (detected.action === 'add_task' && detected.title)
            addTask(
              detected.title,
              detected.dueDate || new Date().toISOString()
            );
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
          executed = true;
        }
      }

      // Ultra-short fallback: treat short inputs as tasks
      if (!executed) {
        const words = question.split(/\s+/).filter(Boolean);
        if (words.length > 0 && words.length <= 6) {
          addTask(question, new Date().toISOString());
          executed = true;
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
          content: 'Sorry, I could not reach UnknownAi right now.',
        },
      ]);
    }
  }

  return (
    <div className='card'>
      <div className='mb-3 text-lg font-semibold'>Chat with UnknownAi</div>

      <div className='max-h-[50vh] overflow-y-auto space-y-2 pr-2'>
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === 'user' ? 'text-right' : 'text-left'}
          >
            <div
              className={`inline-block max-w-[80%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
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
          placeholder='Ask: List my tasks • Summarize my notes • Set due date for ... • Rename task ...'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />
        <button
          className='btn primary'
          onClick={sendMessage}
          aria-label='Send message'
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
