// src/features/analyze/LoadingView.jsx
import { useEffect, useMemo, useState } from "react";

export default function LoadingView({ file, onCancel }) {
  // 이미지 미리보기 (파일일 때만)
  const previewUrl = useMemo(() => {
    if (!file || !file.type?.startsWith("image/")) return null;
    return URL.createObjectURL(file);
  }, [file]);

  // 컴포넌트 unmount 시 blob 해제
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // 가짜 진행률 (85%까지만 올라가고, 실제 결과 오면 화면 전환)
  const [progress, setProgress] = useState(6);
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 2 : 85));
    }, 120);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="dash-wrap">
      {/* 상단 바 */}
      <div className="dash-topbar" style={{ justifyContent: "space-between" }}>
        <div className="brand">
          FakeCheck <span className="check">✓</span>
        </div>
        <button className="btn" onClick={onCancel}>✕ Cancel</button>
      </div>

      {/* 로딩 패널 */}
      <section className="panel">
        <div className="panel-head">
          <div className="panel-title">
            <strong>Analyzing…</strong>
            <span className="tag">Image</span>
          </div>
        </div>

        <div className="analyze-body">
          {/* 미리보기 + 파일명 */}
          <div className="preview">
            {previewUrl ? (
              <img src={previewUrl} alt="preview" />
            ) : (
              <div className="preview-empty">preview</div>
            )}
            <div className="preview-meta">
              <div className="name">{file?.name || "파일명 없음"}</div>
              <div className="desc">
                창을 닫아도 분석은 계속 진행됩니다. 결과는 이 화면에 표시돼요.
              </div>
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
        </div>
      </section>
    </div>
  );
}
