'use client';

import React, { useState } from 'react';
import { Logo } from '@/components/site/Header';

export default function AdminLogin() {
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    const password = new FormData(e.currentTarget).get('password');
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ password }) });
    if (res.ok) window.location.href = '/admin';
    else {
      setError((await res.json().catch(() => ({}))).error ?? 'Gagal masuk');
      setBusy(false);
    }
  };
  return (
    <main className="admin-login">
      <form onSubmit={submit} className="admin-login-card">
        <Logo />
        <h1>Panel admin</h1>
        <div className="field">
          <label htmlFor="pw">Password</label>
          <input id="pw" name="password" type="password" autoComplete="current-password" className="text-input" required
            aria-invalid={!!error} aria-describedby={error ? 'pw-err' : undefined} />
          {error && <p className="field-error" id="pw-err" role="alert">{error}</p>}
        </div>
        <button className="btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>{busy ? 'Masuk…' : 'Masuk'}</button>
      </form>
    </main>
  );
}
