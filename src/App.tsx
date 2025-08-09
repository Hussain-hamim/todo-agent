import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ClipboardList, Brain, Network } from 'lucide-react';
import Backdrop from './components/Backdrop';
import Landing from './pages/Landing';
import Work from './pages/Work';
import Whiteboard from './pages/Whiteboard';
import Agent from './pages/Agent';
import Reports from './pages/Reports';
import Account from './pages/Account';

function NavBar() {
  const location = useLocation();
  const linkBase =
    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition';
  const active = 'bg-white/15';
  const inactive = 'hover:bg-white/10';

  return (
    <nav className='hidden sm:block sticky top-0 z-50 border-b border-white/10 bg-[#0b1220]/70 backdrop-blur-xl'>
      <div className='mx-auto max-w-7xl px-4'>
        <div className='flex h-16 items-center justify-between'>
          {/* Left - Logo */}
          <NavLink to='/'>
            <div className='font-extrabold tracking-tight text-white'>
              UnknownAi
            </div>
          </NavLink>

          {/* Center - Nav Links */}
          <div className='flex items-center gap-2'>
            <NavLink
              to='/work'
              className={`${linkBase} ${
                location.pathname.startsWith('/work') ? active : inactive
              }`}
            >
              <ClipboardList size={16} /> Work
            </NavLink>

            <NavLink
              to='/agent'
              className={`${linkBase} ${
                location.pathname.startsWith('/agent') ? active : inactive
              }`}
            >
              <Brain size={16} /> UnknownAi
            </NavLink>
          </div>

          {/* Right - Empty space (or future buttons) */}
          <div className='w-[80px]' />
        </div>
      </div>
    </nav>
  );
}

function MobileNavBar() {
  const location = useLocation();
  const isActive = (path: string) =>
    location.pathname.startsWith(path) ? 'text-white' : 'text-white/70';
  const itemBase =
    'flex flex-col items-center justify-center gap-1 flex-1 py-2';

  return (
    <nav
      className='sm:hidden flex justify-center fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0b1220]/70 backdrop-blur-xl'
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className='mx-auto max-w-7xl'>
        <div className='grid grid-cols-3 text-xs'>
          <NavLink
            to='/'
            className={`${itemBase} ${isActive('/')}`}
            aria-label='home'
          >
            <ClipboardList size={18} />
            <span>Home</span>
          </NavLink>
          <NavLink
            to='/work'
            className={`${itemBase} ${isActive('/work')}`}
            aria-label='work'
          >
            <Network size={18} />
            <span>Work</span>
          </NavLink>
          <NavLink
            to='/agent'
            className={`${itemBase} ${isActive('/agent')}`}
            aria-label='UnknownAi'
          >
            <Brain size={18} />
            <span>UnknownAi</span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className='min-h-screen pb-24 sm:pb-0'>
      <Backdrop />
      <NavBar />
      <main className='mx-auto max-w-7xl px-4 py-6'>
        <Routes>
          <Route path='/' element={<Landing />} />
          <Route path='/work' element={<Work />} />
          <Route path='/whiteboard' element={<Whiteboard />} />
          <Route path='/agent' element={<Agent />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/account' element={<Account />} />
        </Routes>
      </main>
      <MobileNavBar />
    </div>
  );
}
