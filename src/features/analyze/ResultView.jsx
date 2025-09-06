// src/features/analyze/ResultView.jsx
import { useMemo, useEffect, useRef } from "react";
import { toPng } from "html-to-image";

export default function ResultView({ data, file, onRetry }) {
  if (!data) return null;

  // 캡처할 DOM 참조
  const cardRef = useRef(null);

  // ── 미리보기 URL ─────────────────────────────
  const previewUrl = useMemo(() => {
    if (file && file.type?.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return data.imageUrl || null;
  }, [file, data?.imageUrl]);

  useEffect(() => {
    return () => {
      // blob URL 정리
      if (file && previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, file]);

  // 점수 매핑
  const aiProb   = clamp01((data.aiProbability ?? 0) / 100);
  const realProb = clamp01((data.realProbability ?? (100 - (data.aiProbability ?? 0))) / 100);

  // 배지/톤
  const badge = getBadgeFromServer(data.riskLevel, aiProb);

  // 현재 시간
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} `
                + `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  // ── 리포트 PNG 다운로드 ──────────────────────
  const handleDownloadReport = async () => {
    if (!cardRef.current) return;
    try {
      // 배경이 투명으로 나오지 않게 다크 배경을 지정 (네 앱 기본 배경과 맞춤)
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,                 // 2배 해상도로 선명하게
        backgroundColor: "#0f1115",    // 다크 배경
        // 캡처에서 제외할 요소 필터 (원하면 유지/제외 조절)
        filter: (node) => {
          // 버튼 영역(공유/좋아요 등) 제외하려면 아래 클래스 걸러내기
          const cls = (node.className || "").toString();
          if (cls.includes("reactions")) return false;
          return true;
        },
      });

      // 파일 이름 구성
      const base =
        file?.name?.replace(/\.[^.]+$/, "") ||
        (data.analysisId ? `fakecheck-${data.analysisId}` : `fakecheck-${Date.now()}`);

      // 다운로드 트리거
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${base}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err) {
      console.error(err);
      alert("리포트 이미지 저장에 실패했어요. (콘솔 확인)");
    }
  };

  return (
    <div className="dash-wrap">
      <div className="dash-topbar">
      </div>

      {/* ⬇⬇⬇ 이 섹션 전체가 캡처 대상 ⬇⬇⬇ */}
      <section className="result-card" ref={cardRef}>
        <div className="result-head">
          <div className="name">{data.analysisId ? `#${data.analysisId}` : (file?.name || "분석 결과")}</div>
          <div className={`badge ${badge.tone}`}>{badge.label}</div>
          <div className="time">{dateStr}</div>
        </div>

        <div className="result-body">
          {/* 좌측 */}
          <div className="result-left">
            <div className="preview-box">
              {previewUrl ? (
                // 외부 URL 이미지를 캡처할 때 CORS 문제가 생길 수 있음 → 서버에서 CORS 헤더 허용 필요
                <img src={previewUrl} alt="preview" crossOrigin="anonymous" />
              ) : (
                <div className="preview-empty">preview</div>
              )}
            </div>

            <div className="score-block">
              <ScoreRow label="실사 가능성" value={realProb} tone="ok" />
              <ScoreRow label="AI 의심 신호" value={aiProb} tone="sus" rightPercent />
            </div>

            <p className="caption left-note">
              ⓘ 결과는 확률로 제공됩니다. 원본은 동의 없이 저장되지 않습니다.
            </p>
          </div>

          {/* 우측 */}
          <div className="result-right">
            <div className="verdict">
              <div className="title">결론 (Verdict)</div>
              <p className="desc">{data.conclusion || badge.defaultDesc}</p>
            </div>

            {Array.isArray(data.evidences) && data.evidences.length > 0 && (
              <div className="evidence">
                <div className="title">주요 근거</div>
                <ul>
                  {data.evidences.map((v, i) => <li key={i}>{v}</li>)}
                </ul>
              </div>
            )}

            <div className="legend card">
              <div className="legend-title">FakeCheck 임계값</div>
              <div className="legend-body">
                <span className="chip-safe">70% 이상 → 안전</span>
                <span className="chip-warn">40% ~ 69% → 주의</span>
                <span className="chip-danger">39% 이하 → 위험</span>
              </div>
            </div>

            <div className="actions">
              <button className="btn" onClick={onRetry}>⟲ Back</button>
              {/* ⬇ 여기만 기존 onClick을 교체 */}
              <button className="primary" onClick={handleDownloadReport}>
                ⬇ 리포트 다운로드
              </button>
            </div>

            
          </div>
        </div>
      </section>
      {/* ⬆⬆⬆ 캡처 대상 끝 ⬆⬆⬆ */}
    </div>
  );
}

/* 이하 기존 유틸/컴포넌트 동일 */
function ScoreRow({ label, value, tone = "ok", rightPercent = false }) {
  const pct = (value * 100).toFixed(1);
  return (
    <div className="score-row">
      <div className="score-top">
        <span>{label}</span>
        <span className={`percent ${tone}`}>{pct}%</span>
      </div>
      <div className="score-rail">
        {!rightPercent && <div className={`score-bar ${tone}`} style={{ width: `${pct}%` }} />}
        {rightPercent && <div className={`score-bar ${tone}`} style={{ width: `${pct}%`, marginLeft: "auto" }} />}
      </div>
    </div>
  );
}

function getBadgeFromServer(riskLevel, aiProb) {
  if (typeof riskLevel === "string") {
    const key = riskLevel.trim();
    if (key.includes("위험"))  return { label: "위험", tone: "danger", defaultDesc: "판단이 매우 불확실합니다. 사실 검증이 권장됩니다." };
    if (key.includes("주의"))  return { label: "주의", tone: "warn",   defaultDesc: "판단이 불확실합니다. 추가 확인을 권장합니다." };
    if (key.includes("안전"))  return { label: "안전", tone: "safe",   defaultDesc: "실제일 가능성이 높습니다. 다만 추가 확인을 권장합니다." };
  }
  if (aiProb >= 0.85) return { label: "위험", tone: "danger", defaultDesc: "판단이 매우 불확실합니다. 사실 검증이 권장됩니다." };
  if (aiProb >= 0.70) return { label: "주의", tone: "warn",   defaultDesc: "판단이 불확실합니다. 추가 확인을 권장합니다." };
  return { label: "안전", tone: "safe", defaultDesc: "실제일 가능성이 높습니다. 다만 추가 확인을 권장합니다." };
}
function clamp01(n) { return Math.min(1, Math.max(0, n)); }
