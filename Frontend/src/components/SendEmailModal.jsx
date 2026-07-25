import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { sendSingleEmailThunk, sendBulkEmailsThunk, clearNotificationFeedback } from '../redux/slices/notificationSlice';

const inputSt = (focused) => ({
  width: '100%', background: 'var(--bg-2)',
  border: `1px solid ${focused ? 'var(--accent)' : 'var(--border)'}`,
  borderRadius: '7px', color: 'var(--text)',
  fontSize: '13px', padding: '10px 12px', outline: 'none',
  fontFamily: "'Inter', sans-serif",
  boxShadow: focused ? '0 0 0 3px var(--accent-sub)' : 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
});

const labelSt = {
  display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--text-2)',
  marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.05em',
};

const FInput = ({ as: As = 'input', ...props }) => {
  const [focused, setFocused] = useState(false);
  return <As {...props} style={{ ...inputSt(focused), ...(props.style || {}) }} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
};

const SendEmailModal = ({ isOpen, onClose, mode = 'single', onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { loading, error, successMessage } = useSelector((state) => state.notifications);

  const [to, setTo] = useState('');
  const [title, setTitle] = useState('');
  const [from, setFrom] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [recipientsText, setRecipientsText] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [localFeedback, setLocalFeedback] = useState({ success: null, message: '' });

  const isBulk = mode === 'bulk';
  const isScheduledMode = mode === 'scheduled';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      const emails = [...new Set((ev.target.result.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || []))];
      if (emails.length > 0) {
        setRecipientsText(emails.join(', '));
        setLocalFeedback({ success: true, message: `Parsed ${emails.length} emails from "${file.name}"` });
      } else {
        setLocalFeedback({ success: false, message: `No valid emails found in "${file.name}"` });
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(clearNotificationFeedback());
    setLocalFeedback({ success: null, message: '' });

    const userId = user?.id || user?._id || 'user_demo';
    const deliveryTime = scheduledAt ? new Date(scheduledAt).toISOString() : null;
    const isImmediate = !scheduledAt;

    if (isBulk) {
      const list = recipientsText.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      if (!list.length) { setLocalFeedback({ success: false, message: 'Provide at least one recipient.' }); return; }
      const result = await dispatch(sendBulkEmailsThunk({ userId, title: title || 'Bulk Campaign', from, subject, body, recipients: list, scheduledAt: deliveryTime }));
      if (sendBulkEmailsThunk.fulfilled.match(result)) {
        setLocalFeedback({ success: true, message: isImmediate ? `${list.length} emails queued.` : `Campaign scheduled for ${new Date(scheduledAt).toLocaleString()}.` });
        if (onSuccess) onSuccess();
        setTimeout(() => { handleReset(); onClose(); }, 1500);
      } else {
        setLocalFeedback({ success: false, message: result.payload || 'Failed to dispatch campaign.' });
      }
    } else {
      const result = await dispatch(sendSingleEmailThunk({ userId, to, from, subject, body, scheduledAt: deliveryTime }));
      if (sendSingleEmailThunk.fulfilled.match(result)) {
        setLocalFeedback({ success: true, message: isImmediate ? 'Email dispatched instantly.' : `Scheduled for ${new Date(scheduledAt).toLocaleString()}.` });
        if (onSuccess) onSuccess();
        setTimeout(() => { handleReset(); onClose(); }, 1500);
      } else {
        setLocalFeedback({ success: false, message: result.payload || 'Failed to send email.' });
      }
    }
  };

  const handleReset = () => {
    setTo(''); setTitle(''); setSubject(''); setBody('');
    setRecipientsText(''); setScheduledAt(''); setCsvFileName('');
    setLocalFeedback({ success: null, message: '' });
    dispatch(clearNotificationFeedback());
  };

  if (!isOpen) return null;

  const msg = localFeedback.message || successMessage || error;
  const isOk = localFeedback.success !== null ? localFeedback.success : !!successMessage;
  const modalTitle = isBulk ? 'New Bulk Campaign' : isScheduledMode ? 'Schedule Email' : 'Send Email';

  return (
    <AnimatePresence>
      <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', fontFamily: "'Inter', sans-serif" }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 14 }}
          transition={{ duration: 0.2 }}
          style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: '12px', width: '100%', maxWidth: '480px', boxShadow: 'var(--shadow-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
        >
          {/* Header */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text)' }}>{modalTitle}</span>
            </div>
            <button onClick={() => { handleReset(); onClose(); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-3)', display: 'flex', alignItems: 'center', borderRadius: '5px', padding: '4px', transition: 'color 0.15s' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-3)'; }}>
              <span className="material-symbols-outlined" style={{ fontSize: '19px' }}>close</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '13px', overflowY: 'auto', maxHeight: '72vh' }}>
            {/* Feedback */}
            {msg && (
              <div style={{ padding: '9px 12px', borderRadius: '7px', fontSize: '13px', display: 'flex', alignItems: 'flex-start', gap: '7px', background: isOk ? 'var(--success-sub)' : 'var(--danger-sub)', border: `1px solid ${isOk ? 'var(--success-bdr)' : 'var(--danger-bdr)'}`, color: isOk ? 'var(--success)' : 'var(--danger)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '15px', flexShrink: 0, marginTop: '1px' }}>{isOk ? 'check_circle' : 'error'}</span>
                {msg}
              </div>
            )}

            {isBulk ? (
              <>
                <div><label style={labelSt}>Campaign Title</label><FInput type="text" required placeholder="Q4 Product Launch" value={title} onChange={(e) => setTitle(e.target.value)} /></div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                    <label style={{ ...labelSt, marginBottom: 0 }}>Upload CSV</label>
                    {csvFileName && <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', color: 'var(--accent)' }}>📄 {csvFileName}</span>}
                  </div>
                  <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px', padding: '12px', borderRadius: '7px', border: '1px dashed var(--accent-bdr)', cursor: 'pointer', background: 'var(--accent-sub)', color: 'var(--text-2)', fontSize: '12px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: 'var(--accent)' }}>upload_file</span>
                    Browse CSV or TXT file
                    <input type="file" accept=".csv,.txt" onChange={handleFileUpload} style={{ display: 'none' }} />
                  </label>
                </div>
                <div><label style={labelSt}>Recipients (comma or line separated)</label><FInput as="textarea" required rows={3} placeholder="user1@co.com, user2@co.com" value={recipientsText} onChange={(e) => setRecipientsText(e.target.value)} style={{ resize: 'vertical' }} /></div>
              </>
            ) : (
              <div><label style={labelSt}>To (Recipient Email)</label><FInput type="email" required placeholder="recipient@company.com" value={to} onChange={(e) => setTo(e.target.value)} /></div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={labelSt}>From (Optional)</label>
                <FInput type="text" placeholder="Defaults to EMAIL_FROM (.env)" value={from} onChange={(e) => setFrom(e.target.value)} />
                <div style={{ fontSize: '10px', color: 'var(--text-3)', marginTop: '3px' }}>Leave blank to use default EMAIL_FROM from .env</div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <label style={{ ...labelSt, marginBottom: 0 }}>Schedule</label>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '9px', fontWeight: 700, color: scheduledAt ? 'var(--warning)' : 'var(--success)', textTransform: 'uppercase' }}>{scheduledAt ? 'Scheduled' : 'Immediate'}</span>
                </div>
                <FInput type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} />
              </div>
            </div>

            <div><label style={labelSt}>Subject</label><FInput type="text" required placeholder="Email subject" value={subject} onChange={(e) => setSubject(e.target.value)} /></div>
            <div><label style={labelSt}>Message Body</label><FInput as="textarea" required rows={4} placeholder="Write your message..." value={body} onChange={(e) => setBody(e.target.value)} style={{ resize: 'vertical' }} /></div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '9px', paddingTop: '4px', borderTop: '1px solid var(--border)' }}>
              <button type="button" onClick={() => { handleReset(); onClose(); }} style={{ padding: '9px 16px', borderRadius: '7px', border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-2)', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>
                Cancel
              </button>
              <button type="submit" disabled={loading} style={{ padding: '9px 18px', borderRadius: '7px', border: 'none', background: 'var(--accent)', color: 'var(--accent-fg)', fontSize: '13px', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", display: 'flex', alignItems: 'center', gap: '5px', opacity: loading ? 0.75 : 1 }}>
                {loading ? (
                  <><span className="material-symbols-outlined spin" style={{ fontSize: '14px' }}>progress_activity</span>Sending...</>
                ) : (
                  <><span className="material-symbols-outlined" style={{ fontSize: '14px' }}>{scheduledAt ? 'schedule_send' : 'send'}</span>{scheduledAt ? 'Schedule' : isBulk ? 'Send Campaign' : 'Send Email'}</>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SendEmailModal;
