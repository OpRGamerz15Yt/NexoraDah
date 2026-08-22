import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity, AlertTriangle, ArrowUpRight, Bot, ChevronDown, CircleHelp,
  FileText, Gauge, Github, LayoutDashboard, LogIn, Menu, MessageSquare,
  PanelLeftClose, PanelLeftOpen, Radio, Search, Server, Settings, Shield,
  Sparkles, Ticket, Users, X
} from 'lucide-react';
import './styles.css';

const communityUrl = 'https://discord.gg/BH5TcybwG4';
const apiOrigin = import.meta.env.VITE_API_URL || '';
const apiUrl = (path) => `${apiOrigin}${path}`;
const navGroups = [
  { label: 'Workspace', items: [['Overview', LayoutDashboard], ['Analytics', Activity], ['Moderation', Shield], ['Tickets', Ticket], ['Applications', FileText]] },
  { label: 'Configure', items: [['AutoMod', AlertTriangle], ['Security', Shield], ['AI control', Sparkles], ['Roles', Users], ['Logging', Radio], ['Server settings', Settings]] }
];

async function api(path, options) {
  const response = await fetch(apiUrl(path), { credentials: 'include', ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'The dashboard API is unavailable.');
  return body;
}

function StatusPill({ children, tone = 'neutral' }) { return <span className={`status-pill ${tone}`}><span />{children}</span>; }

function Login({ configured, error }) {
  return <main className="login-shell">
    <div className="login-aside"><div className="brand-mark"><Bot size={23} /></div><p className="eyebrow">Vynix Studio presents</p><h1>NEXORA<br /><em>PRIME</em></h1><p className="login-tagline">Powering your Discord server.</p><div className="login-footer"><a href={communityUrl} target="_blank" rel="noreferrer">Join our Discord <ArrowUpRight size={15} /></a></div></div>
    <section className="login-panel"><div className="login-card"><div className="mini-mark"><Bot size={18} /></div><p className="eyebrow">Command center</p><h2>Bring your server<br />into focus.</h2><p className="muted">Sign in with Discord to manage the servers where you have permission. Nexora never asks for your Discord password.</p>{error && <div className="error-box"><AlertTriangle size={17} />{error}</div>}{configured ? <a className="primary-button login-button" href={apiUrl('/api/auth/login')}><LogIn size={17} />Continue with Discord</a> : <div className="setup-box"><AlertTriangle size={17} /><div><strong>Discord OAuth is not configured</strong><span>Add the Discord credentials to the backend environment before sign-in can be enabled.</span></div></div>}<p className="fine-print">Your access is checked server-side on every request.</p></div><div className="login-meta"><span>SECURE ACCESS</span><span>VYNIX STUDIO</span><a href={communityUrl} target="_blank" rel="noreferrer">Support <ArrowUpRight size={13} /></a></div></section>
  </main>;
}

function EmptyState({ title, children }) { return <div className="empty-state"><div className="empty-icon"><Server size={21} /></div><h3>{title}</h3><p>{children}</p></div>; }

function Overview({ user, server, onSelectServer }) {
  const [servers, setServers] = useState([]); const [loading, setLoading] = useState(true); const [message, setMessage] = useState('');
  useEffect(() => { api('/api/servers').then((result) => setServers(result.servers || [])).catch((e) => setMessage(e.message)).finally(() => setLoading(false)); }, []);
  return <>
    <div className="page-heading"><div><p className="eyebrow">Workspace overview</p><h1>Good to see you, {user.username}</h1><p className="muted">Choose a server to open its live control surface.</p></div><StatusPill tone="warning">{server ? 'Awaiting bot connection' : 'No server selected'}</StatusPill></div>
    {message && <div className="error-box wide"><AlertTriangle size={17} />{message}</div>}
    <section className="signal-grid"><div className="signal-card accent"><span>BOT CONNECTION</span><strong>{server ? 'Not connected' : 'Select a server'}</strong><small>{server ? 'The bot must be installed and configured for live data.' : 'Your server list is fetched from Discord after sign-in.'}</small></div><div className="signal-card"><span>YOUR IDENTITY</span><strong>{user.username}</strong><small>Discord ID · {user.id}</small></div><div className="signal-card"><span>DATA POLICY</span><strong>Live only</strong><small>No placeholder analytics or fabricated metrics.</small></div></section>
    <section className="section-block"><div className="section-title"><div><p className="eyebrow">Available servers</p><h2>Manage a server</h2></div><span className="count-label">{loading ? 'Loading from Discord...' : `${servers.length} available`}</span></div>{loading ? <div className="server-list"><div className="skeleton" /><div className="skeleton" /></div> : servers.length ? <div className="server-list">{servers.map((item) => <button className="server-row" key={item.id} onClick={() => onSelectServer(item)}><span className="server-avatar">{item.icon ? <img src={item.icon} alt="" /> : <Server size={19} />}</span><span><strong>{item.name}</strong><small>{item.permission === 'owner' ? 'Owner' : 'Manage server'}</small></span><ArrowUpRight size={17} /></button>)}</div> : <EmptyState title="No manageable servers found">Discord did not return a server where your account has management access.</EmptyState>}</section>
  </>;
}

function App() {
  const [session, setSession] = useState(null); const [authError, setAuthError] = useState(''); const [active, setActive] = useState('Overview'); const [server, setServer] = useState(null); const [sidebarOpen, setSidebarOpen] = useState(true); const [loading, setLoading] = useState(true);
  useEffect(() => { api('/api/session').then(setSession).catch((e) => setAuthError(e.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <div className="loading-screen"><div className="brand-mark"><Bot size={23} /></div><div className="loader" /></div>;
  if (!session?.authenticated) return <Login configured={session?.configured ?? false} error={authError || new URLSearchParams(location.search).get('error')} />;
  const user = session.user;
  return <div className="app-shell"><aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}><div className="side-top"><div className="brand-mark"><Bot size={21} /></div>{sidebarOpen && <div><strong>NEXORA</strong><small>PRIME / CONTROL</small></div>}<button className="icon-button side-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">{sidebarOpen ? <PanelLeftClose size={17} /> : <PanelLeftOpen size={17} />}</button></div><div className="server-picker">{server ? <><span className="server-avatar small">{server.icon ? <img src={server.icon} alt="" /> : <Server size={15} />}</span>{sidebarOpen && <span>{server.name}</span>}<ChevronDown size={15} /></> : <><span className="server-avatar small"><Server size={15} /></span>{sidebarOpen && <span>Select server</span>}<ChevronDown size={15} /></>}</div><nav>{navGroups.map((group) => <div className="nav-group" key={group.label}>{sidebarOpen && <p>{group.label}</p>}{group.items.map(([label, Icon]) => <button className={active === label ? 'active' : ''} key={label} onClick={() => setActive(label)} title={label}><Icon size={17} /><span>{label}</span></button>)}</div>)}</nav><div className="side-bottom">{sidebarOpen && <a href={communityUrl} target="_blank" rel="noreferrer"><CircleHelp size={16} /> Support</a>}<a href="https://github.com/OpRGamerz15Yt/NexoraDah" target="_blank" rel="noreferrer"><Github size={16} />{sidebarOpen && 'Repository'}</a><a className="profile" href={apiUrl('/api/auth/logout')}><span className="user-avatar">{user.avatar ? <img src={user.avatar} alt="" /> : user.username[0]}</span>{sidebarOpen && <span><strong>{user.username}</strong><small>Sign out</small></span>}</a></div></aside><div className="mobile-bar"><button className="icon-button" onClick={() => setSidebarOpen(true)}><Menu size={20} /></button><strong>NEXORA PRIME</strong><button className="icon-button" onClick={() => setSidebarOpen(false)}><X size={19} /></button></div><main className="content"><header className="topbar"><div className="crumb"><Gauge size={16} /> <span>Control center</span> <span>/</span> <strong>{active}</strong></div><div className="top-actions"><button className="icon-button" aria-label="Search"><Search size={18} /></button><StatusPill tone="live">API online</StatusPill></div></header>{active === 'Overview' ? <Overview user={user} server={server} onSelectServer={setServer} /> : <div className="page-heading"><div><p className="eyebrow">{active}</p><h1>{active} workspace</h1><p className="muted">This surface is ready for live bot and database integration.</p></div></div>}<footer><span>© 2026 Vynix Studio</span><a href={communityUrl} target="_blank" rel="noreferrer">Join Discord <ArrowUpRight size={13} /></a></footer></main></div>;
}

createRoot(document.getElementById('root')).render(<App />);