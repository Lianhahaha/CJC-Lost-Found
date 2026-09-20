'use client';
import { useEffect, useId, useRef } from 'react';
import { statusMeta } from '@/lib/constants';
import { IconAlert, IconCheckCircle, IconInfo } from './Icons';

/* ── Status badge ────────────────────────────────────────── */
export function StatusBadge({ item, className = '' }) {
  const meta = statusMeta(item);
  return <span className={`badge ${meta.badge} ${className}`}>{meta.label}</span>;
}

/* ── Notice (inline alert) ───────────────────────────────── */
export function Notice({ type = 'info', children, role }) {
  const Icon = type === 'success' ? IconCheckCircle : type === 'info' ? IconInfo : IconAlert;
  return (
    <div className={`notice notice-${type}`} role={role || (type === 'danger' ? 'alert' : 'status')}>
      <Icon />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}

/* ── Form field wrapper ──────────────────────────────────── */
export function Field({ label, required, optional, hint, error, children, count }) {
  const id = useId();
  const errId = `${id}-err`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errId : null, hint ? hintId : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label className="label" htmlFor={id}>
        {label}
        {required && <span className="req" aria-hidden="true">*</span>}
        {optional && <span className="opt">(optional)</span>}
      </label>
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {error ? (
        <span className="field-error" id={errId}><IconAlert /> {error}</span>
      ) : hint ? (
        <span className="hint" id={hintId}>{hint}</span>
      ) : null}
      {count ? <span className="count-hint">{count}</span> : null}
    </div>
  );
}

/* ── Empty state ─────────────────────────────────────────── */
export function EmptyState({ icon, title, children, actions }) {
  return (
    <div className="empty">
      {icon && <div className="empty-icon">{icon}</div>}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {actions && <div className="row">{actions}</div>}
    </div>
  );
}

/* ── Skeleton grid ───────────────────────────────────────── */
export function SkeletonGrid({ count = 8 }) {
  return (
    <div className="grid" aria-busy="true" aria-label="Loading items">
      {Array.from({ length: count }).map((_, i) => (
        <div className="skeleton-card" key={i}>
          <div className="skeleton sk-media" />
          <div className="sk-body">
            <div className="skeleton sk-line" style={{ width: '70%' }} />
            <div className="skeleton sk-line" style={{ width: '95%' }} />
            <div className="skeleton sk-line" style={{ width: '45%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Modal (focus trapped, Esc to close) ─────────────────── */
export function Modal({ title, children, onClose, labelledBy }) {
  const ref = useRef(null);
  const titleId = useId();
  const closeRef = useRef(onClose);
  useEffect(() => { closeRef.current = onClose; }, [onClose]);

  useEffect(() => {
    const close = () => closeRef.current?.();
    const prev = document.activeElement;
    const node = ref.current;
    const focusables = () =>
      Array.from(node?.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') || [])
        .filter((el) => !el.disabled);
    focusables()[0]?.focus();

    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      const els = focusables();
      if (!els.length) return;
      const first = els[0];
      const last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      if (prev && typeof prev.focus === 'function') prev.focus();
    };
  }, []);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy || titleId} ref={ref}>
        {title && <h2 id={titleId}>{title}</h2>}
        {children}
      </div>
    </div>
  );
}
