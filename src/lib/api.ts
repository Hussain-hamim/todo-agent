import axios from 'axios';

const explicitBase = import.meta.env.VITE_API_BASE?.toString().trim();
const defaultProdBase = 'https://todo-agent-ltin.onrender.com';
const resolvedBase =
  explicitBase ||
  (import.meta.env.MODE === 'production' ? defaultProdBase : '');

export function agentEndpoint(path: string) {
  if (resolvedBase)
    return `${resolvedBase.replace(/\/$/, '')}${
      path.startsWith('/') ? path : `/${path}`
    }`;
  return path;
}

export async function postAgent(payload: unknown) {
  const url = agentEndpoint('/api/agent');
  return axios.post(url, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
}
