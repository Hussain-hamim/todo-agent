import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { ClipboardList, Brain, BarChart3, User, Network } from 'lucide-react';
import Work from './pages/Work';
import Whiteboard from './pages/Whiteboard';
import Agent from './pages/Agent';
import Reports from './pages/Reports';
import Account from './pages/Account';

function NavBar() {
  const location = useLocation();
  const linkBase = 'flex items-center gap-2 px-3 py-2 rounded-md text-sm';
  const active = 'bg-white/15';
  const inactive = 'hover:bg-white/10';

  return (
    <nav className='sticky top-0 z-50 border-b border-white/10 bg-[#1E2A38]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1E2A38]/60'>
      <div className='mx-auto max-w-7xl px-4'>
        <div className='flex h-14 items-center gap-2'>
          <div className='font-semibold tracking-wide'>KarryTask</div>
          <div className='ml-4 flex items-center gap-1'>
            <NavLink
              to='/work'
              className={`${linkBase} ${
                location.pathname.startsWith('/work') ? active : inactive
              }`}
            >
              <ClipboardList size={16} /> Work
            </NavLink>
            <NavLink
              to='/whiteboard'
              className={`${linkBase} ${
                location.pathname.startsWith('/whiteboard') ? active : inactive
              }`}
            >
              <Network size={16} /> Whiteboard
            </NavLink>
            <NavLink
              to='/agent'
              className={`${linkBase} ${
                location.pathname.startsWith('/agent') ? active : inactive
              }`}
            >
              <Brain size={16} /> Mr. Karry
            </NavLink>
            <NavLink
              to='/reports'
              className={`${linkBase} ${
                location.pathname.startsWith('/reports') ? active : inactive
              }`}
            >
              <BarChart3 size={16} /> Reports
            </NavLink>
            <NavLink
              to='/account'
              className={`${linkBase} ${
                location.pathname.startsWith('/account') ? active : inactive
              }`}
            >
              <User size={16} /> Account
            </NavLink>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <div className='min-h-screen'>
      <NavBar />
      <main className='mx-auto max-w-7xl px-4 py-6'>
        <Routes>
          <Route path='/' element={<Work />} />
          <Route path='/work' element={<Work />} />
          <Route path='/whiteboard' element={<Whiteboard />} />
          <Route path='/agent' element={<Agent />} />
          <Route path='/reports' element={<Reports />} />
          <Route path='/account' element={<Account />} />
        </Routes>
      </main>
    </div>
  );
}
