import { useState } from 'react';
import { useAppStore } from '../store';

export default function Account() {
  const { isAuthenticated, login, logout } = useAppStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isAuthenticated) {
    return (
      <div className='card max-w-md'>
        <div className='mb-3 text-lg font-semibold'>Login</div>
        <form
          className='space-y-2'
          onSubmit={(e) => {
            e.preventDefault();
            login();
          }}
        >
          <input
            className='input'
            placeholder='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className='input'
            placeholder='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button className='btn w-full' type='submit'>
            Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='card'>
        <div className='mb-2 text-lg font-semibold'>Profile</div>
        <div className='text-sm text-white/70'>
          Signed in as: {email || 'demo@user.local'}
        </div>
        <button className='btn mt-3' onClick={logout}>
          Logout
        </button>
      </div>
      <div className='card'>
        <div className='mb-2 text-lg font-semibold'>
          Integrations (Placeholders)
        </div>
        <ul className='list-disc pl-5 text-white/80'>
          <li>Gmail (send email)</li>
          <li>Google Calendar (sync events)</li>
          <li>Notion (notes)</li>
          <li>Slack (messages)</li>
          <li>Maps (context)</li>
        </ul>
      </div>
    </div>
  );
}
