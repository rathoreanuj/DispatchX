import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../components/Sidebar';
import SendEmailModal from '../components/SendEmailModal';
import { fetchUserCampaignsThunk } from '../redux/slices/notificationSlice';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { campaigns, stats, loading: notificationLoading } = useSelector((state) => state.notifications);

  const [activeTab, setActiveTab] = useState('overview');
  const [modalConfig, setModalConfig] = useState({ isOpen: false, mode: 'single' });

  const userId = user?.id || user?._id || 'user_demo';
  const fetchData = () => dispatch(fetchUserCampaignsThunk(userId));

  useEffect(() => { if (userId) fetchData(); }, [userId]);

  // Auto-open compose modal if query param is set
  useEffect(() => {
    if (searchParams.get('compose') === 'true' || searchParams.get('action') === 'send') {
      const mode = searchParams.get('mode') || 'single';
      setModalConfig({ isOpen: true, mode });
    }
  }, [searchParams]);

  const openSingleModal = (mode = 'single') => setModalConfig({ isOpen: true, mode });
  const openBulkModal = () => setModalConfig({ isOpen: true, mode: 'bulk' });
  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  let totalCampaigns = stats?.totalCampaigns ?? campaigns.length;
  let totalEmails = stats?.totalEmailsDispatched ?? 0;
  let delivered = stats?.successfulDeliveries ?? 0;
  let failed = stats?.failedDeliveries ?? 0;

  if (!stats && campaigns.length > 0) {
    totalCampaigns = campaigns.length;
    campaigns.forEach((c) => {
      const r = c.total || 1;
      totalEmails += r;
      if (c.status === 'FAILED') failed += r;
      else delivered += r;
    });
  }

  const successRate = totalEmails > 0 ? ((delivered / totalEmails) * 100).toFixed(1) : '100.0';

  const statCards = [
    { label: 'Emails Dispatched', value: totalEmails, icon: 'mark_email_read', sub: `${successRate}% delivered` },
    { label: 'Campaigns', value: totalCampaigns, icon: 'campaign', sub: 'Outbox protected' },
    { label: 'Delivered', value: delivered, icon: 'check_circle', sub: 'Idempotent delivery' },
    { label: 'Failed / Retried', value: failed, icon: 'report_problem', sub: '5 retries max' },
  ];

  const pipeline = [
    { label: 'MongoDB Outbox', detail: 'PENDING events' },
    { label: 'Publisher', detail: '5s poll' },
    { label: 'RabbitMQ', detail: 'PUBLISHED → QUEUED' },
    { label: 'Workers', detail: '30 msg / 10s' },
    { label: 'DLQ Monitor', detail: '30s polling' },
  ];

  const getStatusColor = (s) => {
    if (!s) return 'var(--warning)';
    if (s === 'COMPLETED' || s === 'DELIVERED') return 'var(--success)';
    if (s === 'FAILED' || s === 'CANCELLED') return 'var(--danger)';
    if (s === 'SCHEDULED') return 'var(--warning)';
    return 'var(--accent)';
  };

  const getStatusBg = (s) => {
    if (!s) return 'var(--warning-sub)';
    if (s === 'COMPLETED' || s === 'DELIVERED') return 'var(--success-sub)';
    if (s === 'FAILED' || s === 'CANCELLED') return 'var(--danger-sub)';
    if (s === 'SCHEDULED') return 'var(--warning-sub)';
    return 'var(--accent-sub)';
  };

  const card = { background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '10px', padding: '22px' };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: "'Inter', sans-serif", display: 'flex' }}>
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onOpenSingleModal={openSingleModal} onOpenBulkModal={openBulkModal} />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        {/* Top bar */}
        <header style={{ height: '58px', background: 'var(--bg-1)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>
              {{ overview: 'Overview', campaigns: 'Campaigns', pipeline: 'Pipeline', failures: 'Failures & DLQ' }[activeTab]}
            </span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'var(--success-sub)', border: '1px solid var(--success-bdr)', borderRadius: '100px', padding: '2px 8px' }}>
              <span className="dot-online" />
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9.5px', color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Live</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: 'var(--text-3)' }}>
              Outbox poll: <span style={{ color: 'var(--accent)' }}>5s</span>
            </span>
            <button onClick={fetchData} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', borderRadius: '7px', border: '1px solid var(--border)', background: 'var(--bg-2)', color: 'var(--text-2)', fontSize: '12px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-2)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}>
              <span className={`material-symbols-outlined ${notificationLoading ? 'spin' : ''}`} style={{ fontSize: '14px' }}>refresh</span>
              Refresh
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1200px', width: '100%' }}>
          {/* Welcome banner */}
          <div style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', borderColor: 'var(--accent-bdr)' }}>
            <div>
              <h1 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.3px', marginBottom: '3px' }}>
                Good to see you, {user?.name?.split(' ')[0] || 'there'} 👋
              </h1>
              <p style={{ fontSize: '13px', color: 'var(--text-2)' }}>
                Monitor email campaigns, delivery stats, and your outbox pipeline.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', flexShrink: 0 }}>
              <button onClick={() => openSingleModal('single')} style={{ padding: '8px 16px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>send</span>
                Send Email
              </button>
              <button onClick={openBulkModal} style={{ padding: '8px 16px', borderRadius: '7px', border: '1px solid var(--border)', cursor: 'pointer', background: 'var(--bg-2)', color: 'var(--text)', fontSize: '13px', fontWeight: 500, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>mark_email_unread</span>
                Bulk Campaign
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
            {statCards.map((c, i) => (
              <motion.div key={i} whileHover={{ y: -3 }} style={card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: "'JetBrains Mono', monospace" }}>{c.label}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--accent)' }}>{c.icon}</span>
                </div>
                <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)', letterSpacing: '-1px', lineHeight: 1 }}>{c.value}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-3)', marginTop: '5px', fontFamily: "'JetBrains Mono', monospace" }}>{c.sub}</div>
              </motion.div>
            ))}
          </div>

          {/* Pipeline */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--accent)' }}>stream</span>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Delivery Pipeline</h2>
              </div>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--success)', background: 'var(--success-sub)', border: '1px solid var(--success-bdr)', padding: '2px 8px', borderRadius: '4px' }}>
                All systems operational
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto' }}>
              {pipeline.map((p, i) => (
                <React.Fragment key={i}>
                  <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '8px', padding: '12px 14px', minWidth: '130px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 700, color: 'var(--accent)' }}>{i + 1}</span>
                      <span className="dot-online" />
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text)', marginBottom: '2px' }}>{p.label}</div>
                    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--text-3)' }}>{p.detail}</div>
                  </div>
                  {i < pipeline.length - 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: '14px', color: 'var(--text-3)' }}>arrow_forward</span>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Campaigns table */}
          <div style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', paddingBottom: '14px', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '17px', color: 'var(--accent)' }}>campaign</span>
                <h2 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text)' }}>Recent Campaigns</h2>
              </div>
              <button onClick={openBulkModal} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '12px', fontWeight: 600, fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>add</span>
                New Campaign
              </button>
            </div>

            {campaigns.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '38px', color: 'var(--text-3)' }}>inbox</span>
                <p style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-2)' }}>No campaigns yet</p>
                <p style={{ fontSize: '12px', color: 'var(--text-3)', maxWidth: '260px', lineHeight: 1.6 }}>
                  Send your first email or create a bulk campaign to get started.
                </p>
                <button onClick={() => openSingleModal('single')} style={{ padding: '9px 18px', borderRadius: '7px', border: 'none', cursor: 'pointer', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif", marginTop: '4px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>send</span>
                  Send First Email
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="dx-table">
                  <thead>
                    <tr>
                      {['Campaign', 'Recipients', 'Scheduled At', 'Status', ''].map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((camp) => (
                      <tr key={camp._id}>
                        <td style={{ fontWeight: 600 }}>{camp.title}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-2)' }}>{camp.total || 1}</td>
                        <td style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '12px', color: 'var(--text-2)' }}>{new Date(camp.scheduledAt || camp.createdAt).toLocaleString()}</td>
                        <td>
                          <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", background: getStatusBg(camp.status), color: getStatusColor(camp.status) }}>
                            {camp.status || 'SCHEDULED'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button onClick={() => alert(`ID: ${camp._id}\nStatus: ${camp.status}`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)', fontSize: '12px', fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>
                            Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      <SendEmailModal isOpen={modalConfig.isOpen} mode={modalConfig.mode} onClose={closeModal} onSuccess={fetchData} />
    </div>
  );
};

export default Dashboard;
