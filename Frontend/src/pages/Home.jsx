import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('curl');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);

  const snippets = {
    curl: `curl -X POST https://api.dispatchx.io/v1/send \\
  -H "Authorization: Bearer dsp_live_9f81a7b" \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "user@company.com",
    "from": "noreply@yourapp.io",
    "subject": "Welcome to DispatchX",
    "body": "Your account is now active."
  }'`,
    payload: `{
  "notification_id": "ntf_9938cba42",
  "scheduled_at": "2026-10-10T10:00:00.000Z",
  "retry_policy": {
    "strategy": "exponential_backoff",
    "max_retries": 5,
    "base_delay_ms": 1000
  },
  "status": "QUEUED"
}`,
    response: `{
  "status": "accepted",
  "notification_id": "ntf_9938cba42",
  "queued_at": "2026-10-10T09:58:31.120Z",
  "delivery_eta_ms": 1820,
  "retry_enabled": true
}`,
  };

  const handleSimulate = () => {
    setIsSimulating(true);
    setSimulationResult(null);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationResult({ status: '202 Accepted', latency: '1.41ms' });
    }, 700);
  };

  const features = [
    { icon: 'shield', title: 'API Gateway', desc: 'Rate-limited reverse proxy with JWT authentication and sliding window controls.', tag: 'Security' },
    { icon: 'layers', title: 'Transactional Outbox', desc: 'Atomic MongoDB writes ensure zero message loss even during service failures.', tag: 'Reliability' },
    { icon: 'hub', title: 'RabbitMQ Queuing', desc: 'Durable message broker with dead-letter queue for guaranteed delivery.', tag: 'Messaging' },
    { icon: 'bolt', title: 'Worker Service', desc: 'Idempotent email workers with Redis-backed rate limiting and retry logic.', tag: 'Performance' },
    { icon: 'schedule', title: 'Scheduled Delivery', desc: 'Schedule individual or bulk emails to be delivered at a precise future time.', tag: 'Scheduling' },
    { icon: 'monitoring', title: 'Prometheus Metrics', desc: 'Real-time performance telemetry with Prometheus scrape endpoints on every service.', tag: 'Observability' },
  ];

  const stats = [
    { value: '6K+', label: 'Emails / second' },
    { value: '99.99%', label: 'Delivery SLA' },
    { value: '< 4ms', label: 'Ingestion latency' },
    { value: '0.00%', label: 'Packet loss' },
  ];

  const pipelineSteps = [
    { step: 1, label: 'API Gateway', sublabel: 'Auth & Rate Limit', icon: 'shield' },
    { step: 2, label: 'Outbox DB', sublabel: 'Atomic Write', icon: 'storage' },
    { step: 3, label: 'Publisher', sublabel: '5s Poll', icon: 'sync' },
    { step: 4, label: 'RabbitMQ', sublabel: 'Queue', icon: 'hub' },
    { step: 5, label: 'Worker', sublabel: 'SMTP Delivery', icon: 'send' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <Navbar />

      {/* spacer */}
      <div style={{ height: '60px' }} />

      {/* ── HERO ── */}
      <section style={{ padding: '72px 24px 56px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px' }}>
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--accent-sub)', border: '1px solid var(--accent-bdr)', borderRadius: '100px', padding: '4px 12px' }}
          >
            <span className="dot-online" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--accent)', letterSpacing: '0.04em' }}>
              v2.4 — All systems operational
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.05 }}
            style={{ fontSize: 'clamp(34px, 5.5vw, 60px)', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-1.5px', color: 'var(--text)', maxWidth: '760px' }}
          >
            Reliable email delivery,
            <br />
            <span style={{ color: 'var(--accent)' }}>built for fault tolerance.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{ fontSize: '16px', color: 'var(--text-2)', lineHeight: 1.7, maxWidth: '480px' }}
          >
            DispatchX is a distributed notification service with zero message loss,
            automated retries, and real-time observability.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}
          >
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to={user ? "/dashboard" : "/register"} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'var(--accent)', color: 'var(--accent-fg)',
                fontWeight: 600, fontSize: '14px', padding: '11px 22px',
                borderRadius: '8px', textDecoration: 'none',
              }}>
                {user ? 'Go to Dashboard' : 'Start for free'}
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to={user ? "/dashboard?compose=true" : "/dashboard"} style={{
                display: 'inline-flex', alignItems: 'center', gap: '7px',
                background: 'var(--bg-2)', color: 'var(--text)',
                fontWeight: 500, fontSize: '14px', padding: '11px 22px',
                borderRadius: '8px', textDecoration: 'none',
                border: '1px solid var(--border)',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>{user ? 'send' : 'grid_view'}</span>
                {user ? 'New Dispatch' : 'Dashboard'}
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.2 }}
            style={{
              marginTop: '40px',
              width: '100%',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              overflow: 'hidden',
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--bg-1)',
                  padding: '24px 20px',
                  textAlign: 'center',
                  borderRight: i < stats.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{ fontSize: '26px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-0.8px', lineHeight: 1 }}>
                  {s.value}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px', fontFamily: "'JetBrains Mono', monospace", textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {s.label}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── INTERACTIVE API DEMO ── */}
      <section style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.45 }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <div style={{ width: '3px', height: '14px', background: 'var(--accent)', borderRadius: '2px' }} />
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>API Reference</span>
              </div>
              <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px', color: 'var(--text)' }}>Simple, predictable REST API</h2>
              <p style={{ color: 'var(--text-2)', marginTop: '8px', fontSize: '14px', maxWidth: '440px' }}>
                Send single emails, bulk campaigns, or schedule for later — all from one endpoint.
              </p>
            </div>

            {/* Terminal card */}
            <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden', boxShadow: 'var(--shadow-md)' }}>
              {/* Header */}
              <div style={{ background: 'var(--bg-2)', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--danger)' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--warning)' }} />
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--success)' }} />
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-3)', marginLeft: '8px' }}>dispatchx — POST /v1/send</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {['curl', 'payload', 'response'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                      padding: '4px 10px', borderRadius: '5px', border: 'none', cursor: 'pointer',
                      background: activeTab === tab ? 'var(--accent-sub)' : 'transparent',
                      color: activeTab === tab ? 'var(--accent)' : 'var(--text-3)',
                      fontWeight: activeTab === tab ? 600 : 400,
                      transition: 'all 0.15s',
                    }}>
                      {tab === 'curl' ? 'cURL' : tab === 'payload' ? 'Payload' : 'Response'}
                    </button>
                  ))}
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSimulate} disabled={isSimulating} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '11px',
                    padding: '5px 12px', borderRadius: '5px',
                    border: '1px solid var(--accent-bdr)',
                    cursor: 'pointer', background: 'var(--accent-sub)', color: 'var(--accent)',
                    display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>play_arrow</span>
                    Run
                  </motion.button>
                </div>
              </div>

              {/* Code */}
              <div style={{ padding: '20px', minHeight: '260px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <AnimatePresence mode="wait">
                  <motion.pre key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} style={{
                    fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', lineHeight: 1.7,
                    color: 'var(--text-2)', whiteSpace: 'pre', overflow: 'auto', flex: 1,
                  }}>
                    {snippets[activeTab]}
                  </motion.pre>
                </AnimatePresence>

                {/* Status bar */}
                <div style={{ marginTop: '16px', padding: '9px 12px', background: 'var(--bg-2)', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontFamily: "'JetBrains Mono', monospace", fontSize: '11px' }}>
                  {isSimulating ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--warning)' }}>
                      <span className="dot-warning" style={{ animation: 'pulse 0.6s infinite' }} />
                      Sending request...
                    </div>
                  ) : simulationResult ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--success)' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>check_circle</span>
                      {simulationResult.status} — {simulationResult.latency}
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', color: 'var(--text-3)' }}>
                      <span className="dot-neutral" style={{ width: '7px', height: '7px', borderRadius: '50%', background: 'var(--text-3)', display: 'inline-block' }} />
                      Ready to send
                    </div>
                  )}
                  <span style={{ color: 'var(--text-3)' }}>Latency: <span style={{ color: 'var(--accent)' }}>1.82ms</span></span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ padding: '72px 24px', background: 'var(--bg-1)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '14px', background: 'var(--accent)', borderRadius: '2px' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Capabilities</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px', color: 'var(--text)' }}>Everything you need</h2>
            <p style={{ color: 'var(--text-2)', marginTop: '8px', fontSize: '14px' }}>Production-grade email infrastructure from day one.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '14px' }}>
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: i * 0.06 }}
                whileHover={{ y: -3 }}
                style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px', cursor: 'default', transition: 'border-color 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-bdr)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'var(--accent-sub)', border: '1px solid var(--accent-bdr)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{f.icon}</span>
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--accent)', background: 'var(--accent-sub)', border: '1px solid var(--accent-bdr)', borderRadius: '4px', padding: '2px 7px', letterSpacing: '0.04em' }}>
                    {f.tag}
                  </span>
                </div>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)', marginBottom: '7px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: 'var(--text-2)', lineHeight: 1.65 }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PIPELINE ── */}
      <section id="architecture" style={{ padding: '72px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} style={{ marginBottom: '40px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <div style={{ width: '3px', height: '14px', background: 'var(--accent)', borderRadius: '2px' }} />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>How it works</span>
            </div>
            <h2 style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.6px', color: 'var(--text)' }}>Zero-loss delivery pipeline</h2>
            <p style={{ color: 'var(--text-2)', marginTop: '8px', fontSize: '14px', maxWidth: '480px' }}>Every email flows through a battle-tested sequence of services designed for reliability.</p>
          </motion.div>

          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {pipelineSteps.map((step, i) => (
                <React.Fragment key={step.step}>
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '110px', flex: 1 }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '10px', background: 'var(--accent-sub)', border: '1px solid var(--accent-bdr)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', position: 'relative' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{step.icon}</span>
                      <div style={{ position: 'absolute', top: '-7px', right: '-7px', width: '16px', height: '16px', borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: 'var(--accent-fg)' }}>
                        {step.step}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)' }}>{step.label}</div>
                      <div style={{ fontSize: '10px', color: 'var(--text-3)', fontFamily: "'JetBrains Mono', monospace", marginTop: '2px' }}>{step.sublabel}</div>
                    </div>
                  </motion.div>
                  {i < pipelineSteps.length - 1 && (
                    <div style={{ flexShrink: 0, paddingBottom: '24px' }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--text-3)' }}>arrow_forward</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { label: 'Outbox poll interval', value: '5 seconds' },
                { label: 'DLQ retry attempts', value: '5 retries' },
                { label: 'Worker rate limit', value: '30 msgs / 10s' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '14px' }}>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{item.label}</div>
                  <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px', fontWeight: 700, color: 'var(--accent)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '72px 24px', background: 'var(--bg-1)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} style={{
            background: 'var(--bg)',
            border: '1px solid var(--accent-bdr)',
            borderRadius: '14px', padding: '52px 40px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '20px',
          }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '22px', color: 'var(--accent-fg)' }}>send</span>
            </div>
            <h2 style={{ fontSize: '30px', fontWeight: 800, letterSpacing: '-0.8px', color: 'var(--text)', maxWidth: '440px', lineHeight: 1.15 }}>
              {user ? 'Jump back into your dashboard' : 'Ready to send your first email?'}
            </h2>
            <p style={{ color: 'var(--text-2)', fontSize: '14px', maxWidth: '380px' }}>
              {user
                ? 'Dispatch transactional emails, launch bulk campaigns, or monitor worker queues in real time.'
                : 'Create an account and start dispatching emails with automatic retries and full observability in minutes.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={user ? "/dashboard" : "/register"} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--accent)', color: 'var(--accent-fg)', fontWeight: 600, fontSize: '14px', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none' }}>
                  {user ? 'Go to Dashboard' : 'Create account'}
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                <Link to={user ? "/dashboard?compose=true" : "/dashboard"} style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', background: 'var(--bg-2)', color: 'var(--text)', fontWeight: 500, fontSize: '14px', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', border: '1px solid var(--border)' }}>
                  {user ? 'New Dispatch' : 'Open Dashboard'}
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
