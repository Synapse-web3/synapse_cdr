import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { GradePill, DomainTag } from './PageShell';
import { useWallet } from './WalletContext';
import { api } from '../lib/api';

function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso)) / 1000);
  if (s < 60)   return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

const STATUS_LABEL = {
  COMMITTED:      'Awaiting Reveal',
  PENDING_REVEAL: 'Pending Reveal',
  REVEALED:       'Awaiting Grade',
  VERIFIED:       'Verified',
  FLAGGED:        'PoP-Shield Flagged',
  REJECTED:       'Rejected',
};

export default function HypothesisPickerModal({ model, onConfirm, onClose }) {
  const [hypotheses, setHypotheses] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [selected, setSelected]     = useState(null);
  const { requireAuth } = useWallet();

  useEffect(() => {
    if (!model) return;
    setSelected(null);
    setLoading(true);

    requireAuth()
      .then(() => api.get('/v1/hypotheses/me?limit=50'))
      .then(r => setHypotheses(Array.isArray(r) ? r : (r.data || [])))
      .catch(() => setHypotheses([]))
      .finally(() => setLoading(false));
  }, [model]);

  if (!model) return null;

  const confirm = (hypothesisId) => {
    onConfirm({ model, hypothesisId: hypothesisId ?? null });
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center md:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl border border-black/10 flex flex-col max-h-[80vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Mobile drag handle */}
        <div className="md:hidden flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-black/20"></div>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-black/8 shrink-0">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Attach Hypothesis</div>
            <h2 className="text-black font-medium text-base">{model.name}</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Select a hypothesis to link to this inference, or skip to run without one.</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-black shrink-0 ml-3 transition-colors"
          >
            <iconify-icon icon="solar:close-circle-linear" width="20"></iconify-icon>
          </button>
        </div>

        {/* List */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {loading ? (
            <div className="flex items-center justify-center py-10 text-zinc-400 text-sm gap-2">
              <iconify-icon icon="solar:spinner-bold" width="18" class="animate-spin"></iconify-icon>
              Loading your hypotheses…
            </div>
          ) : hypotheses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center">
              <iconify-icon icon="solar:flask-minimalistic-bold" width="28" class="text-zinc-300"></iconify-icon>
              <p className="text-zinc-500 text-sm">No hypotheses found.<br/>Commit one in Hypothesis Lab first.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {hypotheses.map(h => {
                const grade = h.gradeActual !== undefined && h.gradeActual !== 255
                  ? String.fromCharCode(65 + h.gradeActual)
                  : (h.grade || h.gradeTarget);
                const isSelected = selected === h.id;
                return (
                  <button
                    key={h.id}
                    onClick={() => setSelected(isSelected ? null : h.id)}
                    className={`w-full text-left rounded-2xl border px-4 py-3 transition-all ${
                      isSelected
                        ? 'border-black bg-black/5 ring-1 ring-black/10'
                        : 'border-black/8 hover:border-black/20 hover:bg-black/[0.02]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                        <GradePill grade={grade} />
                        <DomainTag domain={h.domain} />
                        <span className="text-[10px] text-zinc-500 bg-black/5 px-2 py-0.5 rounded-full">
                          {STATUS_LABEL[h.status] || h.status}
                        </span>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                        isSelected ? 'border-black bg-black' : 'border-black/20'
                      }`}>
                        {isSelected && (
                          <iconify-icon icon="solar:check-bold" width="10" class="text-white"></iconify-icon>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-600 mt-2 line-clamp-2 leading-relaxed">
                      {h.text || <span className="font-mono text-zinc-400">{(h.saltedHash || h.hash || '').slice(0, 24)}…</span>}
                    </p>
                    <div className="text-[10px] text-zinc-400 mt-1.5">
                      {h.createdAt ? timeAgo(h.createdAt) : ''}
                      {h.shortId ? ` · ${h.shortId}` : ''}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-black/8 flex gap-3 shrink-0">
          <button
            onClick={() => confirm(null)}
            className="flex-1 bg-black/5 hover:bg-black/10 text-black py-3 rounded-full text-sm font-medium transition-all"
          >
            Skip — run without linking
          </button>
          <button
            onClick={() => confirm(selected)}
            disabled={!selected}
            className="flex-1 bg-black text-white py-3 rounded-full text-sm font-medium hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            {selected ? 'Dispatch with hypothesis' : 'Select a hypothesis'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
