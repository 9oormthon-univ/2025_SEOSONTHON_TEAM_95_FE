import { useEffect, useMemo, useState } from "react";

export default function LoadingView({ file, onCancel }) {
  // 미리보기 (이미지일 때)
  const previewUrl = useMemo(() => {
    if (!file || !file.type?.startsWith("image/")) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // 진행률(85%까지만 자동 진행 → 결과 오면 App에서 result로 전환)
  const [progress, setProgress] = useState(6);
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 2 : 85));
    }, 120);
    return () => clearInterval(id);
  }, []);

  // 단계 정의 (피그마 텍스트 그대로)
  const steps = [
    "업로드/가져오기",
    "메타데이터·픽셀 분석 준비",
    "진위 판별(모델 인퍼런스)",
    "신뢰도 계산",
    "리포트 생성",
  ];

  // 단계 상태 계산
  const stepPercent = [5, 25, 55, 75, 95]; // 각 단계가 완료되는 진행률
  const stepState = (idx) => {
    if (progress >= stepPercent[idx]) return "done";
    if (idx === 0 || progress >= (stepPercent[idx - 1] || 0)) return "active";
    return "idle";
  };

  return (
    <div className="theme-light">
      <div className="dash-wrap">
        <div className="dash-topbar" style={{ justifyContent: "space-between" }}>
          <div className="brand">FakeCheck <span className="check">✓</span></div>
          <button className="btn" onClick={onCancel}>✕ Cancel</button>
        </div>

        <section className="panel">
          <div className="panel-head">
            <div className="panel-title">
              <strong>Analyzing…</strong>
              <span className="tag">Image</span>
            </div>
          </div>

          <div className="analyze-body">
            {/* 왼쪽: 미리보기 + 파일명 */}
            <div className="preview">
              {previewUrl ? (
                <img src={previewUrl} alt="preview" />
              ) : (
                <div className="preview-empty">preview</div>
              )}
              <div className="preview-meta">
                <div className="name">{file?.name || "파일명 없음"}</div>
                <div className="desc">창을 닫아도 분석은 계속 진행됩니다. 결과는 이 화면에 표시돼요.</div>
              </div>
            </div>

            {/* 진행바 */}
            <div className="progress">
              <div className="progress-top">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="progress-rail">
                <div className="progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {/* 단계 리스트 */}
            <div className="step-list">
              {steps.map((label, i) => {
                const s = stepState(i); // 'done' | 'active' | 'idle'
                return (
                  <div key={label} className={`step step--${s}`}>
                    <span className="step-dot" />
                    <span className="step-text">{label}</span>
                  </div>
                );
              })}
            </div>

            <p className="caption" style={{ marginTop: 10 }}>
              결과는 확률로 제공되며, 사용자가 동의하지 않는 한 원본은 저장되지 않습니다.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
