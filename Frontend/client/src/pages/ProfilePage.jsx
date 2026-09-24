import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function ProfilePage() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#147a76]">
        Account / Settings
      </p>
      <h1 className="text-4xl font-extrabold tracking-[-0.07em] sm:text-5xl">Your account</h1>
      <p className="mt-4 text-sm text-[#718087]">Your service desk identity and session details.</p>
      <section className="mt-9 border border-[#dce5e2] bg-white p-6 sm:p-8">
        <div className="flex items-center gap-4 border-b border-[#edf1ef] pb-6">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf6f3] text-xl font-extrabold text-[#0c5b59]">
            {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
          </span>
          <div>
            <h2 className="text-lg font-extrabold">{user?.name || 'Service desk user'}</h2>
            <p className="text-sm text-[#718087]">{user?.email}</p>
          </div>
        </div>
        <dl className="grid gap-5 py-6 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]">Role</dt>
            <dd className="mt-2 text-sm font-bold capitalize">{user?.role}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.12em] text-[#718087]">User ID</dt>
            <dd className="mt-2 break-all font-mono text-xs text-[#718087]">{user?._id}</dd>
          </div>
        </dl>
        <button
          className="border border-[#bd4b46] px-4 py-3 text-xs font-bold text-[#a43e3a] hover:bg-[#fff5f4]"
          type="button"
          onClick={logout}
        >
          Sign out of this workspace
        </button>
      </section>
    </div>
  );
}