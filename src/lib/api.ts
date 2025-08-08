import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE?.toString().trim() || '';

export function agentEndpoint(path: string) {
  if (API_BASE)
    return `${API_BASE.replace(/\/$/, '')}${
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
