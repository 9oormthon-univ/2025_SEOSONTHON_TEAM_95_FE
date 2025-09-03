import { useState, useMemo, useEffect } from "react";

export default function InitView({ onSubmit, form, setForm, onOpenBoard }) {
  const [query, setQuery] = useState("");

  const stats = {
    date: "09/01",
    dailyScans: 60,
    fakeDetected: 35,
    fakeRate: 0.228,
    aiSuspectedRate: 0.152,
  };

  /* 더미 데이터 - total: 지난 7일간 뉴스 2000건 검사/ ok: 정상 / fake: 가짜/ suspect: 의심 판정 */
  const comp = {
    news:   { total: 2000, ok: 900, fake: 800, suspect: 300 },
    image:  { total: 1500, ok: 700, fake: 600, suspect: 200 },
  };

  const handleSearch = () => {
    onSubmit?.({ url: query, text: query, file: null });
  };

  return (
    <div className="dash-wrap">
      {/* 상단 바 */}
      <div className="dash-topbar">
        <div className="brand">FakeCheck <span className="check">✓</span></div>
        <div className="dash-search">
          <input
            className="dash-search-input"
            placeholder="검색할 뉴스의 URL 및 사진을 첨부해주세요."
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
          <button className="btn ghost" onClick={onOpenBoard}>게시판</button>
        </div>
      </div>

      {/* 제목/날짜 */}
      <div className="dash-head">
        <h1 className="dash-title">Today&apos;s Activity</h1>
        <div className="dash-date">Date: {stats.date}</div>
      </div>

      {/* KPI 4개 */}
      <div className="kpi-row">
        <KpiCard title="Daily Scans" value={stats.dailyScans} />
        <KpiCard title="Fake Detected" value={stats.fakeDetected} tone="pink" />
        <KpiCard title="Fake Rate" value={(stats.fakeRate*100).toFixed(1) + '%'} tone="orange" />
        <KpiCard title="AI Suspected Rate" value={(stats.aiSuspectedRate*100).toFixed(1) + '%'} tone="orange2" />
      </div>

      {/* Composition 섹션 */}
      <section className="card">
        <div className="card-head">
          <div className="card-title">Composition by Category (Last 7 Days)</div>
          <button className="chip">7 Days</button>
        </div>

        <StackedRow
          icon="📰"
          label="News"
          total={comp.news.total}
          ok={comp.news.ok}
          fake={comp.news.fake}
          suspect={comp.news.suspect}
        />
        <StackedRow
          icon="🖼️"
          label="Image"
          total={comp.image.total}
          ok={comp.image.ok}
          fake={comp.image.fake}
          suspect={comp.image.suspect}
        />

        <p className="caption">
          FakeCheck는 최근 7일간의 검사 데이터를 요약한 결과를 제공합니다. 원본은 등의 없이 저장되지 않습니다.
        </p>
      </section>

      <section className="card">
      <h3 style={{marginTop:0}}>파일 업로드</h3>
      <div className="row">
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => {
            const f = e.target.files?.[0] || null;
            setForm((prev) => ({ ...prev, file: f }));
      }}
    />
    <button
      className="primary"
      onClick={() => onSubmit?.(form)}
      disabled={!form.file && !query}  // 파일 없고 URL/텍스트도 없으면 비활성
    >
      검사하기
    </button>
  </div>

      {/* 선택: 이미지 미리보기 */}
      <UploadPreview file={form.file} />
    </section>


      {/* (선택) 실제 검사 입력 섹션 – 해커톤 시연용
      <section className="card">
        <h3>빠른 검사</h3>
        <div className="row">
          <input
            className="text-input"
            placeholder="URL 또는 텍스트를 입력"
            value={query}
            onChange={(e)=>setQuery(e.target.value)}
          />
          <button className="primary" onClick={handleSearch}>검사하기</button>
        </div>
      </section> */}
    </div>
  );
}

/* ───── 내부 소컴포넌트 ───── */

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
  const w = (n)=> (n / sum) * 100;

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
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  if (!previewUrl) return null;
  return (
    <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center" }}>
      <img
        src={previewUrl}
        alt="preview"
        style={{ width: 72, height: 72, objectFit: "cover", borderRadius: 10, border: "1px solid #e6e8ee" }}
      />
      <div style={{ fontSize: 12, opacity: .75 }}>{file?.name}</div>
    </div>
  );
}

