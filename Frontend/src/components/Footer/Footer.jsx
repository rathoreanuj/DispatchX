import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const year = new Date().getFullYear();

  const cols = [
    { heading: 'Product', links: [{ label: 'Features', href: '#features' }, { label: 'Architecture', href: '#architecture' }, { label: 'Dashboard', to: '/dashboard' }] },
    { heading: 'Resources', links: [{ label: 'API Reference', to: '/send' }, { label: 'System Status', href: '#' }, { label: 'GitHub', href: '#' }] },
  ];

  const linkSt = { fontSize: '13px', color: 'var(--text-3)', textDecoration: 'none', transition: 'color 0.15s' };

  return (
    <footer style={{ background: 'var(--bg-1)', borderTop: '1px solid var(--border)', fontFamily: "'Inter', sans-serif", color: 'var(--text)' }}>
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '44px 24px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr', gap: '36px', paddingBottom: '36px', borderBottom: '1px solid var(--border)' }}>
          {/* Brand */}
          <div>
            <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '12px' }}>
              <div style={{ width: '26px', height: '26px', borderRadius: '6px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: '9px', color: 'var(--accent-fg)' }}>DX</div>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.2px' }}>DispatchX</span>
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--text-3)', lineHeight: 1.65, maxWidth: '220px' }}>
              Distributed email infrastructure with zero message loss and automatic retries.
            </p>
          </div>

          {cols.map((col) => (
            <div key={col.heading}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '14px' }}>
                {col.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {col.links.map((lnk) =>
                  lnk.to ? (
                    <Link key={lnk.label} to={lnk.to} style={linkSt}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}>
                      {lnk.label}
                    </Link>
                  ) : (
                    <a key={lnk.label} href={lnk.href} style={linkSt}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}>
                      {lnk.label}
                    </a>
                  )
                )}
              </div>
            </div>
          ))}

          {/* Newsletter */}
          <div>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-2)', marginBottom: '14px' }}>
              Stay Updated
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-3)', marginBottom: '10px', lineHeight: 1.6 }}>
              Updates on new features and infrastructure improvements.
            </p>
            <div style={{ display: 'flex', gap: '6px' }}>
              <input type="email" placeholder="you@company.com" style={{ flex: 1, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '6px', color: 'var(--text)', fontSize: '12px', padding: '8px 10px', outline: 'none', fontFamily: "'Inter', sans-serif" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px var(--accent-sub)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }} />
              <button style={{ padding: '8px 12px', borderRadius: '6px', border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-3)' }}>© {year} DispatchX. All rights reserved.</span>
          <div style={{ display: 'flex', gap: '18px' }}>
            {['Privacy Policy', 'Terms of Service', 'Security'].map((item) => (
              <a key={item} href="#" style={linkSt}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-2)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
