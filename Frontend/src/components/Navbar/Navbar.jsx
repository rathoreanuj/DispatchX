import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { logoutUserThunk } from '../../redux/slices/authSlice';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await dispatch(logoutUserThunk());
    navigate('/');
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'Architecture', href: '#architecture' },
    { label: 'Dashboard', to: '/dashboard' },
  ];

  const isLight = theme === 'light';
  const avatarLetter = (user?.name || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <motion.header
      initial={{ y: -64, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        top: 0, left: 0, right: 0,
        zIndex: 100,
        height: '60px',
        background: scrolled
          ? (isLight ? 'rgba(255,255,255,0.95)' : 'rgba(10,10,10,0.95)')
          : (isLight ? 'rgba(255,255,255,0.80)' : 'rgba(10,10,10,0.80)'),
        borderBottom: `1px solid ${scrolled ? 'var(--border)' : 'transparent'}`,
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        transition: 'background 0.25s, border-color 0.25s',
      }}
    >
      <div style={{
        maxWidth: '1180px',
        margin: '0 auto',
        padding: '0 24px',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '7px',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700, fontSize: '11px', color: 'var(--accent-fg)',
          }}>
            DX
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px', lineHeight: 1 }}>
              DispatchX
            </div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Email Infrastructure
            </div>
          </div>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          {navLinks.map((link) =>
            link.to ? (
              <Link
                key={link.label}
                to={link.to}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px', fontWeight: 500,
                  color: location.pathname === link.to ? 'var(--text)' : 'var(--text-2)',
                  textDecoration: 'none',
                  padding: '6px 12px', borderRadius: '6px',
                  background: location.pathname === link.to ? 'var(--bg-2)' : 'transparent',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-2)'; }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = location.pathname === link.to ? 'var(--text)' : 'var(--text-2)';
                  e.currentTarget.style.background = location.pathname === link.to ? 'var(--bg-2)' : 'transparent';
                }}
              >{link.label}</Link>
            ) : (
              <a
                key={link.label}
                href={link.href}
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--text-2)',
                  textDecoration: 'none',
                  padding: '6px 12px', borderRadius: '6px',
                  transition: 'color 0.15s, background 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--bg-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.background = 'transparent'; }}
              >{link.label}</a>
            )
          )}
        </nav>

        {/* Right: theme toggle + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="theme-toggle"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {user ? (
            /* Signed in: round profile icon showing first letter of user's name */
            <div ref={menuRef} style={{ position: 'relative' }}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setMenuOpen(!menuOpen)}
                title={`${user?.name || user?.email || 'User'} — Account menu`}
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: 'var(--accent-fg)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  fontFamily: "'Inter', sans-serif",
                  border: menuOpen ? '2px solid var(--text)' : '2px solid transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  boxShadow: '0 0 0 1px var(--border)',
                  transition: 'border-color 0.15s, box-shadow 0.15s',
                }}
              >
                {avatarLetter}
              </motion.button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 6, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                    style={{
                      position: 'absolute',
                      top: 'calc(100% + 10px)',
                      right: 0,
                      minWidth: '220px',
                      background: 'var(--bg-1)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      padding: '8px',
                      boxShadow: '0 12px 32px rgba(0, 0, 0, 0.4)',
                      zIndex: 200,
                    }}
                  >
                    {/* User header */}
                    <div style={{
                      padding: '8px 10px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '6px',
                    }}>
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'var(--accent)',
                        color: 'var(--accent-fg)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '13px',
                        flexShrink: 0,
                      }}>
                        {avatarLetter}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                          fontSize: '13px',
                          fontWeight: 600,
                          color: 'var(--text)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {user?.name || 'User'}
                        </div>
                        <div style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: '11px',
                          color: 'var(--text-3)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}>
                          {user?.email || ''}
                        </div>
                      </div>
                    </div>

                    {/* Menu links */}
                    <Link
                      to="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-2)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--accent)' }}>grid_view</span>
                      Dashboard
                    </Link>

                    <div style={{ height: '1px', background: 'var(--border)', margin: '6px 0' }} />

                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        fontFamily: "'Inter', sans-serif",
                        textAlign: 'left',
                        transition: 'background 0.15s',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--danger-sub)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--danger)' }}>logout</span>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            /* Not signed in: show Sign In + Get Started */
            <>
              <Link
                to="/login"
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px', fontWeight: 500,
                  color: 'var(--text-2)', textDecoration: 'none',
                  padding: '7px 12px', borderRadius: '7px',
                  border: '1px solid transparent',
                  transition: 'color 0.15s, border-color 0.15s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'transparent'; }}
              >
                Sign In
              </Link>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link
                  to="/register"
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: '13px', fontWeight: 600,
                    color: 'var(--accent-fg)',
                    background: 'var(--accent)',
                    textDecoration: 'none',
                    padding: '7px 16px', borderRadius: '7px',
                    display: 'inline-block',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </motion.header>
  );
};

export default Navbar;
