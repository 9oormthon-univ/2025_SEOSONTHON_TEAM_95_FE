// src/features/analyze/LoadingView.jsx
export default function LoadingView({ onCancel }) {
  return (
    <div className="loading-wrap">
      <div className="loading-card">
        <div className="spinner" />
        <div className="loading-title">분석 중입니다…</div>
        <div className="loading-desc">잠시만 기다려주세요.</div>
        {onCancel && (
          <button className="btn ghost" onClick={onCancel} style={{ marginTop: 12 }}>
            취소
          </button>
        )}
      </div>
    </div>
  );
}
