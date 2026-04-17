import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaDumbbell, FaUsers, FaChartBar, FaSignOutAlt,
  FaShieldAlt, FaHome, FaUserCircle, FaBell,
  FaArrowUp, FaArrowDown, FaVideo, FaTags, FaDatabase,
  FaPlus, FaEdit, FaTrash, FaCheck, FaTimes, FaSync,
  FaSeedling,
} from 'react-icons/fa';
import { api } from '../services/api';
import './AdminDashboard.css';

// ── Admin Guard ──────────────────────────────────────────────────────────────
export const requireAdmin = (navigate) => {
  if (localStorage.getItem('admin_token') !== 'admin_authenticated') {
    navigate('/admin/login');
    return false;
  }
  return true;
};

// ── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, sub, trend, color }) => (
  <div className="admin-stat-card" style={{ '--card-accent': color }}>
    <div className="stat-card-top">
      <div className="stat-icon" style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        {icon}
      </div>
      <span className={`stat-trend ${trend >= 0 ? 'up' : 'down'}`}>
        {trend >= 0 ? <FaArrowUp size={9} /> : <FaArrowDown size={9} />}
        {Math.abs(trend)}%
      </span>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-label">{label}</div>
    {sub && <div className="stat-sub">{sub}</div>}
  </div>
);

// ── Toast ────────────────────────────────────────────────────────────────────
const Toast = ({ msg, type, onClose }) => (
  <div className={`admin-toast admin-toast-${type}`}>
    {msg}
    <button onClick={onClose} className="toast-close"><FaTimes size={10} /></button>
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// VIDEOS TAB (Updated with Numbering and Date Added)
// ═══════════════════════════════════════════════════════════════════════════
const VideosTab = ({ showToast }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editVideo, setEditVideo] = useState(null);
  const [form, setForm] = useState({ title: '', link: '', tags: '' });
  const [seeding, setSeeding] = useState(false);

  const fetchVideos = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getVideos();
      setVideos(Array.isArray(data) ? data : []);
    } catch { setVideos([]); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchVideos(); }, [fetchVideos]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.link.trim()) return;
    const payload = {
      title: form.title,
      link: form.link,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
    };
    try {
      if (editVideo) {
        await api.updateVideo(editVideo.id, payload);
        showToast('Video updated!', 'success');
      } else {
        await api.createVideo(payload);
        showToast('Video added!', 'success');
      }
      setForm({ title: '', link: '', tags: '' });
      setEditVideo(null);
      fetchVideos();
    } catch { showToast('Failed to save video.', 'error'); }
  };

  const handleEdit = (v) => {
    setEditVideo(v);
    setForm({ title: v.title, link: v.link, tags: (v.tags || []).join(', ') });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this video?')) return;
    try {
      await api.deleteVideo(id);
      showToast('Video deleted.', 'success');
      fetchVideos();
    } catch { showToast('Failed to delete.', 'error'); }
  };

  const handleSeed = async () => {
    if (!window.confirm('Push seed videos to database?')) return;
    setSeeding(true);
    try {
      const res = await api.seedVideos();
      showToast(res.message || 'Videos seeded!', 'success');
      fetchVideos();
    } catch { showToast('Seed failed.', 'error'); }
    finally { setSeeding(false); }
  };

  return (
    <div className="admin-tab-content">
      <div className="admin-tab-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 className="admin-section-title" style={{ margin: 0 }}>Manage Videos</h2>
            <span className="admin-count-badge">{videos.length} Total</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="admin-btn admin-btn-outline" onClick={fetchVideos}>
            <FaSync size={12} /> Refresh
          </button>
          <button className="admin-btn admin-btn-seed" onClick={handleSeed} disabled={seeding}>
            <FaSeedling size={12} /> {seeding ? 'Seeding…' : 'Push videos.json to DB'}
          </button>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="admin-form-card">
        <div className="admin-form-row">
          <input
            className="admin-input"
            placeholder="Video title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            required
          />
          <input
            className="admin-input"
            placeholder="YouTube link"
            value={form.link}
            onChange={e => setForm({ ...form, link: e.target.value })}
            required
          />
          <input
            className="admin-input"
            placeholder="Tags (comma-separated)"
            value={form.tags}
            onChange={e => setForm({ ...form, tags: e.target.value })}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
          <button type="submit" className="admin-btn admin-btn-primary">
            {editVideo ? <><FaCheck size={11} /> Update Video</> : <><FaPlus size={11} /> Add Video</>}
          </button>
          {editVideo && (
            <button
              type="button"
              className="admin-btn admin-btn-outline"
              onClick={() => { setEditVideo(null); setForm({ title: '', link: '', tags: '' }); }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Table */}
      <div className="admin-table-wrapper">
        {loading ? (
          <div className="admin-loading">Loading videos…</div>
        ) : videos.length === 0 ? (
          <div className="admin-empty">No videos yet. Add one above or push seed data.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Title</th>
                <th>Link</th>
                <th>Tags</th>
                <th>Added Date</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v, index) => (
                <tr key={v.id}>
                  <td style={{ color: '#94a3b8', fontWeight: '600' }}>{index + 1}</td>
                  <td className="admin-td-title">{v.title}</td>
                  <td>
                    <a href={v.link} target="_blank" rel="noopener noreferrer"
                      className="admin-link" title={v.link}>
                      {v.link.length > 30 ? v.link.slice(0, 30) + '…' : v.link}
                    </a>
                  </td>
                  <td>
                    <div className="admin-tags-cell">
                      {(v.tags || []).map((t, i) => (
                        <span key={i} className="admin-tag-chip">{t}</span>
                      ))}
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: '#64748b' }}>
                    {v.createdAt ? new Date(v.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                    }) : '—'}
                  </td>
                  <td>
                    <div className="admin-action-btns">
                      <button className="admin-icon-action" onClick={() => handleEdit(v)} title="Edit">
                        <FaEdit size={13} color="#6366f1" />
                      </button>
                      <button className="admin-icon-action" onClick={() => handleDelete(v.id)} title="Delete">
                        <FaTrash size={13} color="#ef4444" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ... TagsTab and AdminDashboard components remain the same as your original code ...

// ═══════════════════════════════════════════════════════════════════════════
// TAGS TAB
// ═══════════════════════════════════════════════════════════════════════════
const TagsTab = ({ showToast }) => {
    const [synonyms, setSynonyms] = useState([]);
    const [stopwords, setStopwords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
  
    // Synonym form
    const [editSyn, setEditSyn] = useState(null);
    const [synForm, setSynForm] = useState({ keyword: '', synonyms: '' });
  
    // Stopword form
    const [newStop, setNewStop] = useState('');
  
    const fetchTags = useCallback(async () => {
      setLoading(true);
      try {
        const data = await api.getTags();
        setSynonyms(data.synonyms || []);
        setStopwords(data.stopwords || []);
      } catch { setSynonyms([]); setStopwords([]); }
      finally { setLoading(false); }
    }, []);
  
    useEffect(() => { fetchTags(); }, [fetchTags]);
  
    // ── Synonyms ──────────────────────────────────────────────────────────────
    const saveSynonym = async (e) => {
      e.preventDefault();
      if (!synForm.keyword.trim()) return;
      try {
        await api.saveSynonym({
          id: editSyn ? editSyn.id : null,
          keyword: synForm.keyword.trim(),
          synonyms: synForm.synonyms,
        });
        showToast(editSyn ? 'Synonym updated!' : 'Synonym added!', 'success');
        setEditSyn(null);
        setSynForm({ keyword: '', synonyms: '' });
        fetchTags();
      } catch { showToast('Failed to save synonym.', 'error'); }
    };
  
    const startEditSyn = (item) => {
      setEditSyn(item);
      setSynForm({ keyword: item.keyword, synonyms: (item.synonyms || []).join(', ') });
    };
  
    const deleteSynonym = async (id) => {
      if (!window.confirm('Delete this keyword mapping?')) return;
      try {
        await api.deleteSynonym(id);
        showToast('Synonym deleted.', 'success');
        fetchTags();
      } catch { showToast('Failed to delete.', 'error'); }
    };
  
    // ── Stopwords ─────────────────────────────────────────────────────────────
    const addStopword = async (e) => {
      e.preventDefault();
      if (!newStop.trim()) return;
      try {
        await api.saveStopWord({ word: newStop.trim() });
        showToast('Stopword added!', 'success');
        setNewStop('');
        fetchTags();
      } catch { showToast('Failed to add stopword.', 'error'); }
    };
  
    const deleteStopword = async (id) => {
      try {
        await api.deleteStopWord(id);
        showToast('Stopword removed.', 'success');
        fetchTags();
      } catch { showToast('Failed to delete.', 'error'); }
    };
  
    // ── Seed ──────────────────────────────────────────────────────────────────
    const handleSeed = async () => {
      if (!window.confirm('Load default synonyms and stopwords from JSON?')) return;
      setSeeding(true);
      try {
        const res = await api.seedTags();
        showToast(res.message || 'Tags seeded!', 'success');
        fetchTags();
      } catch { showToast('Seed failed.', 'error'); }
      finally { setSeeding(false); }
    };
  
    return (
      <div className="admin-tab-content">
        <div className="admin-tab-header">
          <h2 className="admin-section-title" style={{ margin: 0 }}>Tags &amp; Logic Management</h2>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="admin-btn admin-btn-outline" onClick={fetchTags}>
              <FaSync size={12} /> Refresh
            </button>
            <button className="admin-btn admin-btn-seed" onClick={handleSeed} disabled={seeding}>
              <FaSeedling size={12} /> {seeding ? 'Seeding…' : 'Load Defaults (JSON)'}
            </button>
          </div>
        </div>
  
        <div className="admin-tags-grid">
          {/* ── LEFT: Synonym Map ── */}
          <div>
            <h3 className="admin-sub-title">Synonym Map</h3>
            <p className="admin-sub-desc">
              Map keywords to synonyms.
              <span className="admin-badge-new"> Red rows</span> = words learned from chat prompts.
            </p>
  
            <form onSubmit={saveSynonym} className="admin-form-card">
              <div className="admin-form-row">
                <input
                  className="admin-input"
                  placeholder="Keyword (e.g. skinny)"
                  value={synForm.keyword}
                  onChange={e => setSynForm({ ...synForm, keyword: e.target.value })}
                  required
                />
                <input
                  className="admin-input"
                  placeholder="Synonyms (comma-separated)"
                  value={synForm.synonyms}
                  onChange={e => setSynForm({ ...synForm, synonyms: e.target.value })}
                  style={{ flex: 2 }}
                />
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button type="submit" className="admin-btn admin-btn-primary">
                  {editSyn ? <><FaCheck size={11} /> Update</> : <><FaPlus size={11} /> Add</>}
                </button>
                {editSyn && (
                  <button
                    type="button"
                    className="admin-btn admin-btn-outline"
                    onClick={() => { setEditSyn(null); setSynForm({ keyword: '', synonyms: '' }); }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
  
            <div className="admin-table-wrapper" style={{ maxHeight: 420 }}>
              {loading ? (
                <div className="admin-loading">Loading…</div>
              ) : synonyms.length === 0 ? (
                <div className="admin-empty">No synonyms yet.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Keyword</th>
                      <th>Synonyms</th>
                      <th style={{ width: 80 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {synonyms.map(item => (
                      <tr key={item.id} className={item.isNew ? 'admin-row-new' : ''}>
                        <td>
                          <strong>{item.keyword}</strong>
                          {item.isNew && <span className="admin-new-badge">NEW</span>}
                        </td>
                        <td>
                          <div className="admin-tags-cell">
                            {(item.synonyms || []).length > 0
                              ? (item.synonyms || []).map((s, i) => (
                                <span key={i} className="admin-tag-chip">{s}</span>
                              ))
                              : <span className="admin-no-syns">No synonyms</span>}
                          </div>
                        </td>
                        <td>
                          <div className="admin-action-btns">
                            <button className="admin-icon-action" onClick={() => startEditSyn(item)} title="Edit">
                              <FaEdit size={13} color="#6366f1" />
                            </button>
                            <button className="admin-icon-action" onClick={() => deleteSynonym(item.id)} title="Delete">
                              <FaTrash size={13} color="#ef4444" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
  
          {/* ── RIGHT: Stop Words ── */}
          <div>
            <h3 className="admin-sub-title">Stop Words</h3>
            <p className="admin-sub-desc">Words removed from user prompts before searching.</p>
  
            <form onSubmit={addStopword} className="admin-form-card" style={{ display: 'flex', gap: 8 }}>
              <input
                className="admin-input"
                placeholder="New stop word…"
                value={newStop}
                onChange={e => setNewStop(e.target.value)}
                required
              />
              <button type="submit" className="admin-btn admin-btn-primary" style={{ flexShrink: 0 }}>
                <FaPlus size={11} /> Add
              </button>
            </form>
  
            <div className="admin-table-wrapper" style={{ maxHeight: 420 }}>
              {loading ? (
                <div className="admin-loading">Loading…</div>
              ) : stopwords.length === 0 ? (
                <div className="admin-empty">No stopwords yet.</div>
              ) : (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Word</th>
                      <th style={{ width: 60 }}>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stopwords.map(sw => (
                      <tr key={sw.id}>
                        <td>{sw.word}</td>
                        <td>
                          <button
                            className="admin-icon-action"
                            onClick={() => deleteStopword(sw.id)}
                            title="Delete"
                          >
                            <FaTimes size={13} color="#ef4444" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, usersWithProfile: 0, usersThisWeek: 0 });
  const [loading, setLoading] = useState(true);
  const [activeNav, setActiveNav] = useState('dashboard');
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    if (!requireAdmin(navigate)) return;
    fetchStats();
  }, [navigate]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://localhost:7176/api/admin/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setStats({ totalUsers: '--', usersWithProfile: '--', usersThisWeek: '--' });
      }
    } catch {
      setStats({ totalUsers: '--', usersWithProfile: '--', usersThisWeek: '--' });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const navItems = [
    { key: 'dashboard', icon: <FaChartBar size={15} />, label: 'Dashboard' },
    { key: 'users', icon: <FaUsers size={15} />, label: 'Users' },
    { key: 'videos', icon: <FaVideo size={15} />, label: 'Videos' },
    { key: 'tags', icon: <FaTags size={15} />, label: 'Tags & Logic' },
  ];

  const pageTitles = {
    dashboard: 'Dashboard Overview',
    users: 'User Management',
    videos: 'Video Management',
    tags: 'Tags & Logic',
  };

  return (
    <div className="admin-dashboard-wrapper">
      {toast && (
        <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />
      )}

      <aside className="admin-sidebar">
        <div className="admin-sidebar-logo">
          <FaDumbbell />
          <span>FitBot <span className="accent">Admin</span></span>
        </div>

        <nav className="admin-nav">
          {navItems.map(item => (
            <button
              key={item.key}
              className={`admin-nav-item ${activeNav === item.key ? 'active' : ''}`}
              onClick={() => setActiveNav(item.key)}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-nav-item switch-btn" onClick={() => navigate('/')}>
            <FaHome size={15} /> Switch to User Mode
          </button>
          <button className="admin-nav-item logout-btn" onClick={handleLogout}>
            <FaSignOutAlt size={15} /> Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1 className="admin-page-title">{pageTitles[activeNav]}</h1>
            <p className="admin-page-sub">Welcome back, Administrator</p>
          </div>
          <div className="admin-header-actions">
            <button className="admin-icon-btn"><FaBell size={16} /></button>
            <div className="admin-avatar"><FaShieldAlt size={16} /></div>
          </div>
        </header>

        <div className="admin-content">
          {activeNav === 'dashboard' && (
            <>
              <div className="admin-stats-grid">
                <StatCard
                  icon={<FaUsers size={18} color="#6366f1" />}
                  label="Total Users" value={loading ? '—' : stats.totalUsers}
                  sub="All registered accounts" trend={12} color="#6366f1"
                />
                <StatCard
                  icon={<FaUserCircle size={18} color="#10b981" />}
                  label="Profiles Created" value={loading ? '—' : stats.usersWithProfile}
                  sub="Users with full profiles" trend={8} color="#10b981"
                />
                <StatCard
                  icon={<FaChartBar size={18} color="#f59e0b" />}
                  label="New This Week" value={loading ? '—' : stats.usersThisWeek}
                  sub="Joined last 7 days" trend={-3} color="#f59e0b"
                />
              </div>

              <div className="admin-info-banner">
                <div className="info-banner-icon"><FaShieldAlt size={20} color="#6366f1" /></div>
                <div>
                  <div className="info-banner-title">Backend Admin Endpoint</div>
                  <div className="info-banner-text">
                    To see live stats, add a <code>GET /api/admin/stats</code> endpoint returning
                    <code>{' { totalUsers, usersWithProfile, usersThisWeek }'}</code>.
                  </div>
                </div>
              </div>

              <div className="admin-section-title">Quick Actions</div>
              <div className="admin-quick-actions">
                <button className="admin-action-card" onClick={() => setActiveNav('users')}>
                  <FaUsers size={22} color="#6366f1" /><span>View All Users</span>
                </button>
                <button className="admin-action-card" onClick={() => setActiveNav('videos')}>
                  <FaVideo size={22} color="#10b981" /><span>Manage Videos</span>
                </button>
                <button className="admin-action-card" onClick={() => setActiveNav('tags')}>
                  <FaTags size={22} color="#f59e0b" /><span>Manage Tags</span>
                </button>
                <button className="admin-action-card" onClick={fetchStats}>
                  <FaChartBar size={22} color="#8b5cf6" /><span>Refresh Stats</span>
                </button>
              </div>
            </>
          )}

          {activeNav === 'users' && (
            <div className="admin-users-placeholder">
              <FaUsers size={48} color="#6366f1" opacity={0.3} />
              <h3>User Management</h3>
              <p>Connect your <code>GET /api/admin/users</code> endpoint to list all registered users here.</p>
              <button className="admin-login-btn-sm" onClick={() => setActiveNav('dashboard')}>
                ← Back to Dashboard
              </button>
            </div>
          )}

          {activeNav === 'videos' && (
            <VideosTab showToast={showToast} />
          )}

          {activeNav === 'tags' && (
            <TagsTab showToast={showToast} />
          )}
        </div>
      </main>
    </div>
  );
}