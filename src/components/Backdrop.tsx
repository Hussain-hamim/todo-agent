import { memo } from 'react';

function BackdropInner() {
  return (
    <div className='pointer-events-none fixed inset-0 -z-10 overflow-hidden'>
      <div className='absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,rgba(99,102,241,0.25)_0%,rgba(0,0,0,0)_60%)]' />
      <div className='animate-blob-slow absolute -top-24 -left-24 h-80 w-80 rounded-full bg-violet-500/15 blur-3xl' />
      <div className='animate-blob-slow absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl' />
      <div className='bg-grid absolute inset-0 opacity-[0.08]' />
    </div>
  );
}

const Backdrop = memo(BackdropInner);
export default Backdrop;
