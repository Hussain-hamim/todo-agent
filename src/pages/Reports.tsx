import { useMemo } from 'react';
import { useAppStore } from '../store';

export default function Reports() {
  const { tasks } = useAppStore();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;
    const today = new Date();
    const todayTasks = tasks.filter(
      (t) => new Date(t.createdAt).toDateString() === today.toDateString()
    );
    return { total, completed, completionRate, todayCount: todayTasks.length };
  }, [tasks]);

  return (
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
      <div className='card'>
        <div className='text-sm text-white/70'>Total Tasks</div>
        <div className='text-3xl font-semibold'>{stats.total}</div>
      </div>
      <div className='card'>
        <div className='text-sm text-white/70'>Completed</div>
        <div className='text-3xl font-semibold'>{stats.completed}</div>
      </div>
      <div className='card'>
        <div className='text-sm text-white/70'>Completion Rate</div>
        <div className='text-3xl font-semibold'>{stats.completionRate}%</div>
      </div>
      <div className='card md:col-span-2 lg:col-span-3'>
        <div className='text-sm text-white/70 mb-2'>Overview</div>
        <div className='h-2 w-full overflow-hidden rounded bg-white/10'>
          <div
            className='h-full bg-white/50'
            style={{ width: `${stats.completionRate}%` }}
          />
        </div>
      </div>
    </div>
  );
}
