// ResultView.jsx (핵심 부분만)
import { useMemo, useEffect } from "react";

export default function ResultView({ data, file, onRetry }) {
  if (!data) return null;

  // 1) 미리보기: 파일이 있으면 파일, 없으면 서버 imageUrl
  const previewUrl = useMemo(() => {
    if (file && file.type?.startsWith("image/")) {
      return URL.createObjectURL(file);
    }
    return data.imageUrl || null;
  }, [file, data?.imageUrl]);

  useEffect(() => {
    return () => { if (file && previewUrl && previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl, file]);

  // 2) 점수 매핑 (서버는 0~100이므로 0~1로 정규화)
  const aiProb   = clamp01((data.aiProbability ?? 0) / 100);
  const realProb = clamp01((data.realProbability ?? (100 - (data.aiProbability ?? 0))) / 100);

  // 3) 배지/톤: riskLevel 우선, 없으면 aiProb로 계산
  const badge = getBadgeFromServer(data.riskLevel, aiProb);

  // 4) 현재 시간
  const now = new Date();
  const dateStr = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")} `
                + `${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}:${String(now.getSeconds()).padStart(2,"0")}`;

  return (
    <div className="theme-light">
      <div className="dash-wrap">
        <div className="dash-topbar">
          <div className="brand">FakeCheck <span className="check">✓</span></div>
        </div>

        <section className="result-card">
          <div className="result-head">
            <div className="name">{data.analysisId ? `#${data.analysisId}` : (file?.name || "분석 결과")}</div>
            <div className={`badge ${badge.tone}`}>{badge.label}</div>
            <div className="time">{dateStr}</div>
          </div>

          <div className="result-body">
            {/* 좌측: 미리보기 + 점수 */}
            <div className="result-left">
              <div className="preview-box">
                {previewUrl ? <img src={previewUrl} alt="preview" /> : <div className="preview-empty">preview</div>}
              </div>

              <div className="score-block">
                <ScoreRow label="실사 가능성" value={realProb} tone="ok" />
                <ScoreRow label="AI 의심 신호" value={aiProb} tone="sus" rightPercent />
              </div>

              <p className="caption left-note">ⓘ 결과는 확률로 제공됩니다. 원본은 동의 없이 저장되지 않습니다.</p>
            </div>

            {/* 우측: 결론/근거/임계값 */}
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
                  <span className="chip safe">70% 이상 → 안전</span>
                  <span className="chip warn">40% ~ 69% → 주의</span>
                  <span className="chip danger">39% 이하 → 위험</span>
                </div>
              </div>

              <div className="actions">
                <button className="btn" onClick={onRetry}>⟲ Back</button>
                <button className="primary">⬇ 리포트 다운로드</button>
              </div>

              <div className="secondary-actions">
                <button className="btn">🔗 공유 링크</button>
                <div className="reactions">
                  <button className="ghost">👍</button>
                  <button className="ghost">👎</button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

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
  // 서버 riskLevel이 오면 그대로 사용
  if (typeof riskLevel === "string") {
    const key = riskLevel.trim();
    if (key.includes("위험"))  return { label: "위험", tone: "danger", defaultDesc: "판단이 매우 불확실합니다. 사실 검증이 권장됩니다." };
    if (key.includes("주의"))  return { label: "주의", tone: "warn",   defaultDesc: "판단이 불확실합니다. 추가 확인을 권장합니다." };
    if (key.includes("안전"))  return { label: "안전", tone: "safe",   defaultDesc: "실제일 가능성이 높습니다. 다만 추가 확인을 권장합니다." };
  }
  // fallback: AI 확률 기반
  if (aiProb >= 0.85) return { label: "위험", tone: "danger", defaultDesc: "판단이 매우 불확실합니다. 사실 검증이 권장됩니다." };
  if (aiProb >= 0.70) return { label: "주의", tone: "warn",   defaultDesc: "판단이 불확실합니다. 추가 확인을 권장합니다." };
  return { label: "안전", tone: "safe", defaultDesc: "실제일 가능성이 높습니다. 다만 추가 확인을 권장합니다." };
}

function clamp01(n) { return Math.min(1, Math.max(0, n)); }
