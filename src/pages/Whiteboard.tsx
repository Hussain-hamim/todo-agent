import '@tldraw/tldraw/tldraw.css';
import { Tldraw } from '@tldraw/tldraw';

export default function Whiteboard() {
  return (
    <div className='card p-0 h-[70vh]'>
      <Tldraw persistenceKey='karrytask-whiteboard' />
    </div>
  );
}
