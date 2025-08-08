import { useState } from 'react';
import { useAppStore } from '../store';
import { CheckCircle2, Circle, Trash2, Plus } from 'lucide-react';

export default function Work() {
  const { tasks, addTask, toggleTask, deleteTask, notes, setNotes } =
    useAppStore();
  const [title, setTitle] = useState('');

  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
      <div className='card'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>To-Do List</h2>
        </div>
        <form
          className='mb-4 flex gap-2'
          onSubmit={(e) => {
            e.preventDefault();
            if (title.trim()) {
              addTask(title.trim());
              setTitle('');
            }
          }}
        >
          <input
            className='input'
            placeholder='Add a task...'
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button className='btn' type='submit' aria-label='Add task'>
            <Plus size={16} />
          </button>
        </form>
        <ul className='space-y-2'>
          {tasks.map((t) => (
            <li
              key={t.id}
              className='flex items-center gap-3 rounded-md border border-white/10 bg-black/10 p-3'
            >
              <button
                onClick={() => toggleTask(t.id)}
                className='text-white/80 hover:text-white'
                aria-label='Toggle task'
              >
                {t.completed ? (
                  <CheckCircle2 size={18} />
                ) : (
                  <Circle size={18} />
                )}
              </button>
              <div className='flex-1'>
                <div
                  className={t.completed ? 'line-through text-white/50' : ''}
                >
                  {t.title}
                </div>
                {t.dueDate && (
                  <div className='text-xs text-white/50'>
                    Due: {new Date(t.dueDate).toLocaleString()}
                  </div>
                )}
              </div>
              <button
                onClick={() => deleteTask(t.id)}
                className='text-white/60 hover:text-red-300'
                aria-label='Delete task'
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className='card'>
        <div className='mb-3 flex items-center justify-between'>
          <h2 className='text-lg font-semibold'>Notepad</h2>
        </div>
        <textarea
          className='input min-h-[340px] resize-y'
          placeholder='Write notes...'
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
    </div>
  );
}
