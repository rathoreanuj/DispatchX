import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { loginUserThunk, registerUserThunk, clearAuthError } from '../redux/slices/authSlice';
import { useTheme } from '../context/ThemeContext';

const Login = ({ initialMode = 'login' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { theme, toggle } = useTheme();

  const { loading, error } = useSelector((state) => state.auth);
  const isRegisterRoute = location.pathname === '/register' || initialMode === 'register';
  const [isLoginMode, setIsLoginMode] = useState(!isRegisterRoute);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localSuccess, setLocalSuccess] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const inputSt = (field) => ({
    width: '100%', background: 'var(--bg-2)',
    border: `1px solid ${focusedField === field ? 'var(--accent)' : 'var(--border)'}`,
    borderRadius: '7px', color: 'var(--text)',
    fontSize: '14px', padding: '11px 14px', outline: 'none',
    fontFamily: "'Inter', sans-serif",
    boxShadow: focusedField === field ? '0 0 0 3px var(--accent-sub)' : 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearAuthError());
    setLocalError(null);
    setLocalSuccess(false);

    let result;
    if (isLoginMode) {
      result = await dispatch(loginUserThunk({ email, password }));
    } else {
      if (!name) { setLocalError('Full name is required.'); return; }
      result = await dispatch(registerUserThunk({ name, email, password }));
    }

    const ok = isLoginMode
      ? loginUserThunk.fulfilled.match(result)
      : registerUserThunk.fulfilled.match(result);

    if (ok) {
      setLocalSuccess(true);
      setTimeout(() => navigate('/dashboard'), 900);
    } else {
      setLocalError(result.payload || 'Authentication failed.');
    }
  };

  const switchMode = (toLogin) => {
    setIsLoginMode(toLogin);
    dispatch(clearAuthError());
    setLocalError(null);
    setLocalSuccess(false);
  };

  const displayedError = localError || error;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", padding: '24px' }}>
      {/* Theme toggle top-right */}
      <button
        onClick={toggle}
        className="theme-toggle"
        style={{ position: 'fixed', top: '16px', right: '16px' }}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>
          {theme === 'dark' ? 'light_mode' : 'dark_mode'}
        </span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '14px', padding: '36px 32px', boxShadow: 'var(--shadow-lg)' }}
      >
        {/* Back */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--text-3)', fontSize: '12px', textDecoration: 'none', marginBottom: '24px' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>arrow_back</span>
          Back
        </Link>

        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '28px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '7px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '10px', color: 'var(--accent-fg)' }}>DX</div>
          <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>DispatchX</span>
        </Link>

        {/* Mode tabs */}
        <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '4px', marginBottom: '24px' }}>
          {[{ label: 'Sign In', val: true }, { label: 'Create Account', val: false }].map((opt) => (
            <button key={opt.label} onClick={() => switchMode(opt.val)} style={{
              flex: 1, padding: '8px', borderRadius: '6px', border: 'none', cursor: 'pointer',
              fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
              background: isLoginMode === opt.val ? 'var(--accent)' : 'transparent',
              color: isLoginMode === opt.val ? 'var(--accent-fg)' : 'var(--text-2)',
              transition: 'all 0.2s',
            }}>{opt.label}</button>
          ))}
        </div>

        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '5px' }}>
          {isLoginMode ? 'Welcome back' : 'Create your account'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-2)', marginBottom: '22px' }}>
          {isLoginMode ? 'Sign in to access your dashboard.' : 'Get started with DispatchX — free.'}
        </p>

        {/* Feedback */}
        <AnimatePresence>
          {displayedError && (
            <motion.div key="err" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'var(--danger-sub)', border: '1px solid var(--danger-bdr)', borderRadius: '7px', padding: '10px 12px', fontSize: '13px', color: 'var(--danger)', marginBottom: '14px', display: 'flex', alignItems: 'flex-start', gap: '7px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px', flexShrink: 0 }}>error</span>
              {displayedError}
            </motion.div>
          )}
          {localSuccess && (
            <motion.div key="ok" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              style={{ background: 'var(--success-sub)', border: '1px solid var(--success-bdr)', borderRadius: '7px', padding: '10px 12px', fontSize: '13px', color: 'var(--success)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '7px' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>check_circle</span>
              {isLoginMode ? 'Signed in! Redirecting...' : 'Account created! Redirecting...'}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <AnimatePresence>
            {!isLoginMode && (
              <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ overflow: 'hidden' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Full Name</label>
                <input type="text" placeholder="Anuj Rathore" value={name} onChange={(e) => setName(e.target.value)} onFocus={() => setFocusedField('name')} onBlur={() => setFocusedField(null)} style={inputSt('name')} required={!isLoginMode} />
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Email</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)} style={inputSt('email')} required />
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
              <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
              {isLoginMode && <a href="#" style={{ fontSize: '12px', color: 'var(--accent)', textDecoration: 'none' }} onClick={(e) => e.preventDefault()}>Forgot?</a>}
            </div>
            <div style={{ position: 'relative' }}>
              <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} onFocus={() => setFocusedField('pwd')} onBlur={() => setFocusedField(null)} style={{ ...inputSt('pwd'), paddingRight: '42px' }} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px' }}>{showPassword ? 'visibility_off' : 'visibility'}</span>
              </button>
            </div>
          </div>

          <motion.button type="submit" disabled={loading || localSuccess} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} style={{
            width: '100%', padding: '12px', borderRadius: '8px', border: 'none', cursor: loading || localSuccess ? 'not-allowed' : 'pointer',
            fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif",
            background: 'var(--accent)', color: 'var(--accent-fg)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
            opacity: loading || localSuccess ? 0.75 : 1, marginTop: '4px',
          }}>
            {loading ? (
              <><span className="material-symbols-outlined spin" style={{ fontSize: '16px' }}>progress_activity</span>{isLoginMode ? 'Signing in...' : 'Creating...'}</>
            ) : localSuccess ? (
              <><span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>Success</>
            ) : (
              <>{isLoginMode ? 'Sign In' : 'Create Account'}<span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span></>
            )}
          </motion.button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '18px 0' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>or</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: 'var(--text-2)' }}>
          {isLoginMode ? "Don't have an account? " : 'Already have one? '}
          <button type="button" onClick={() => switchMode(!isLoginMode)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontWeight: 600, fontSize: '13px', fontFamily: "'Inter', sans-serif", padding: 0 }}>
            {isLoginMode ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
