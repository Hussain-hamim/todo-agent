import '@tldraw/tldraw/tldraw.css';
import { Tldraw } from '@tldraw/tldraw';

export default function Whiteboard() {
  return (
    <div
      className='sm:card sm:p-0 h-[calc(100vh-7rem)] sm:h-[70vh] -mx-4 sm:mx-0'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <Tldraw persistenceKey='hussainai-whiteboard' />
    </div>
  );
}
