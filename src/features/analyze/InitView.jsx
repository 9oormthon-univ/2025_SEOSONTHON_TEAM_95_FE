// src/features/analyze/InitView.jsx
import { useMemo, useEffect } from "react";

export default function InitView({ onSubmit, form, setForm, stats }) {
  // 오늘 날짜 (MM/DD)
  const today = new Date();
  const formattedDate = today.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <div className="dash-wrap">
      {/* 상단 바 */}
      <div className="dash-topbar">
        <div className="brand">
          FakeCheck <span className="check">✓</span>
        </div>
      </div>

      {/* 제목/날짜 */}
      <div className="dash-head">
        <h1 className="dash-title">Today&apos;s Activity</h1>
        <div className="dash-date">Date: {formattedDate}</div>
      </div>

      {/* KPI */}
      <div className="kpi-row">
        <KpiCard title="Daily Scans" value={stats?.total ?? 0} />
        <KpiCard title="Fake Detected" value={stats?.fake ?? 0} tone="pink" />
        <KpiCard
          title="Fake Rate"
          value={
            stats?.total
              ? ((stats.fake / stats.total) * 100).toFixed(1) + "%"
              : "0%"
          }
          tone="orange"
        />
        <KpiCard
          title="AI Suspected Rate"
          value={
            stats?.total
              ? ((stats.suspect / stats.total) * 100).toFixed(1) + "%"
              : "0%"
          }
          tone="orange2"
        />
      </div>

      {/* Composition */}
      <section className="card">
        <div className="card-head">
          <div className="card-title">Composition by Category (This Session)</div>
          <button className="chip">Session</button>
        </div>
        <StackedRow
          icon="🖼️"
          label="Image"
          total={stats?.total ?? 0}
          ok={stats?.ok ?? 0}
          fake={stats?.fake ?? 0}
          suspect={stats?.suspect ?? 0}
        />
        <p className="caption">
          FakeCheck는 이번 브라우저 세션 동안의 검사 데이터를 요약합니다.
          원본은 저장되지 않습니다.
        </p>
      </section>

      {/* 파일 업로드 */}
      <section className="card">
        <h3 style={{ marginTop: 0 }}>파일 업로드</h3>
        <div className="row">
          <label className="input-file">
            이미지 선택하기
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const f = e.target.files?.[0] || null;
                setForm?.((prev) => ({ ...(prev ?? {}), file: f }));
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && form?.file) onSubmit?.(form);
              }}
            />
          </label>

          <button
            className="primary"
            onClick={() => onSubmit?.(form)}
            disabled={!form?.file}
          >
            검사하기
          </button>
        </div>

        <UploadPreview file={form?.file ?? null} />
      </section>
    </div>
  );
}

/* ───── Sub Components ───── */
function KpiCard({ title, value, tone = "default" }) {
  return (
    <div className={`kpi-card ${tone}`}>
      <div className="kpi-title">{title}</div>
      <div className="kpi-value">{value}</div>
    </div>
  );
}

function StackedRow({ icon, label, total, ok, fake, suspect }) {
  const sum = ok + fake + suspect || 1;
  const w = (n) => (n / sum) * 100;
  return (
    <div className="stack-row">
      <div className="stack-meta">
        <span className="stack-icon">{icon}</span>
        <span className="stack-label">{label}</span>
        <span className="stack-total">총 {total.toLocaleString()}건</span>
      </div>
      <div className="stack-bar">
        <div className="seg seg-ok" style={{ width: `${w(ok)}%` }} />
        <div className="seg seg-fake" style={{ width: `${w(fake)}%` }} />
        <div className="seg seg-sus" style={{ width: `${w(suspect)}%` }} />
      </div>
    </div>
  );
}

function UploadPreview({ file }) {
  const previewUrl = useMemo(() => {
    if (!file || !file.type?.startsWith("image/")) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  if (!previewUrl) return null;
  return (
    <div
      style={{
        marginTop: 10,
        display: "flex",
        gap: 10,
        alignItems: "center",
      }}
    >
      <img
        src={previewUrl}
        alt="preview"
        style={{
          width: 72,
          height: 72,
          objectFit: "cover",
          borderRadius: 10,
          border: "1px solid #e6e8ee",
        }}
      />
      <div style={{ fontSize: 12, opacity: 0.75 }}>{file?.name}</div>
    </div>
  );
}
