import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUserThunk } from '../redux/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ activeTab, setActiveTab, onOpenSingleModal, onOpenBulkModal }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme, toggle } = useTheme();

  const handleLogout = async () => {
    await dispatch(logoutUserThunk());
    navigate('/login');
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: 'grid_view' },
    { id: 'campaigns', label: 'Campaigns', icon: 'campaign' },
    { id: 'pipeline', label: 'Pipeline', icon: 'stream' },
    { id: 'failures', label: 'Failures & DLQ', icon: 'report_problem' },
  ];

  const avatarLetter = user?.name ? user.name.charAt(0).toUpperCase() : 'U';

  const sidebarBtn = (active) => ({
    width: '100%', padding: '9px 11px', borderRadius: '7px',
    border: active ? '1px solid var(--accent-bdr)' : '1px solid transparent',
    cursor: 'pointer',
    background: active ? 'var(--accent-sub)' : 'transparent',
    color: active ? 'var(--accent)' : 'var(--text-2)',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    fontFamily: "'Inter', sans-serif",
    display: 'flex', alignItems: 'center', gap: '9px',
    marginBottom: '2px', textAlign: 'left',
    transition: 'all 0.15s',
  });

  return (
    <aside style={{
      width: '232px', background: 'var(--bg-1)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      fontFamily: "'Inter', sans-serif", flexShrink: 0,
    }}>
      {/* Brand */}
      <div style={{ height: '58px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '10px', color: 'var(--accent-fg)', flexShrink: 0 }}>DX</div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.1px' }}>DispatchX</div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '8.5px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Dashboard</div>
          </div>
        </Link>
        {/* Theme toggle */}
        <button onClick={toggle} className="theme-toggle" title={theme === 'dark' ? 'Light mode' : 'Dark mode'} style={{ width: '28px', height: '28px' }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>{theme === 'dark' ? 'light_mode' : 'dark_mode'}</span>
        </button>
      </div>

      {/* Quick Actions */}
      <div style={{ padding: '14px 10px 10px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 5px 8px' }}>Actions</div>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onOpenSingleModal} style={{ ...sidebarBtn(false), background: 'var(--accent)', color: 'var(--accent-fg)', border: 'none', marginBottom: '6px', fontWeight: 600 }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>send</span>
          Send Email
        </motion.button>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={onOpenBulkModal} style={sidebarBtn(false)}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>mark_email_unread</span>
          Bulk Campaign
        </motion.button>

        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} onClick={() => onOpenSingleModal('scheduled')} style={sidebarBtn(false)}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; }}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>schedule</span>
          Schedule Email
        </motion.button>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 10px 0' }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '0 5px 8px' }}>Navigation</div>
        {navItems.map((item) => {
          const active = activeTab === item.id;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} style={sidebarBtn(active)}
              onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--text)'; } }}
              onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-2)'; } }}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px', color: active ? 'var(--accent)' : 'var(--text-3)' }}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Profile */}
      <div style={{ padding: '12px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '9px' }}>
        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '12px', color: 'var(--accent-fg)', flexShrink: 0 }}>
          {avatarLetter}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email || ''}</div>
        </div>
        <button onClick={handleLogout} title="Sign Out" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: '4px', borderRadius: '5px', display: 'flex', alignItems: 'center', transition: 'color 0.2s, background 0.2s' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.background = 'var(--danger-sub)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.background = 'none'; }}>
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
