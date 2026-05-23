const BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

function getToken() {
  return localStorage.getItem('synapse:auth') || null;
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }));
    throw Object.assign(new Error(err?.error?.message || res.statusText), {
      code: err?.error?.code,
      status: res.status,
    });
  }

  return res.json();
}

export const api = {
  get:    (path)        => request('GET',    path),
  post:   (path, body)  => request('POST',   path, body),
  patch:  (path, body)  => request('PATCH',  path, body),
  delete: (path)        => request('DELETE', path),
};

// ── Auth (Sign-In With Ethereum) ──────────────────────────────────────────────

export async function siwe(walletAddress, signMessageFn) {
  const { nonce } = await api.post('/auth/nonce', { wallet: walletAddress });
  const message = `Sign in to Synapse Protocol\n\nWallet: ${walletAddress}\nNonce: ${nonce}`;
  // wagmi's signMessageAsync returns a 0x-prefixed hex signature
  const signature = await signMessageFn(message);
  const { token, refreshToken } = await api.post('/auth/verify', {
    wallet: walletAddress.toLowerCase(),
    signature,
    message,
  });
  localStorage.setItem('synapse:auth', token);
  if (refreshToken) localStorage.setItem('synapse:refresh', refreshToken);
  return token;
}

export function clearAuth() {
  localStorage.removeItem('synapse:auth');
  localStorage.removeItem('synapse:refresh');
}
