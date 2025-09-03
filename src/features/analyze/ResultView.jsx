import { useMemo, useEffect } from "react";

export default function ResultView({ data, file, onRetry, onGoBoard }) {
  if (!data) return null;

  // ----- 미리보기 (이미지일 때만) -----
  const previewUrl = useMemo(() => {
    if (!file || !file.type?.startsWith("image/")) return null;
    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  // ----- 점수 가공 -----
  // 일치도(consistency.score)와 AI 의심(authenticity.ai_score)을 조합해서
  // "실사 가능성"을 대략 계산 (임시 로직: 가중 평균)
  const consistency = clamp01(data.consistency?.score ?? 0.5);
  const ai = clamp01(data.authenticity?.ai_score ?? 0.5);
  const threshold = data.authenticity?.threshold ?? 0.7;

  const realProb = clamp01(consistency * 0.6 + (1 - ai) * 0.4);   // 0~1
  const aiProb   = ai;                                            // 0~1

  const badge = getBadge(aiProb, threshold); // {label, tone}

  const dateStr = new Date().toISOString().slice(0,16).replace("T"," ");

  return (
    <div className="theme-light">
      <div className="dash-wrap">
        <div className="dash-topbar">
          <div className="brand">FakeCheck <span className="check">✓</span></div>
        </div>

        <section className="result-card">
          {/* 헤더: 파일명 + 배지 + 시간 */}
          <div className="result-head">
            <div className="name">{file?.name || "분석 결과"}</div>
            <div className={`badge ${badge.tone}`}>{badge.label}</div>
            <div className="time">{dateStr}</div>
          </div>

          <div className="result-body">
            {/* 좌측: 미리보기 */}
            <div className="result-left">
              <div className="preview-box">
                {previewUrl ? (
                  <img src={previewUrl} alt="preview" />
                ) : (
                  <div className="preview-empty">preview</div>
                )}
              </div>

              {/* 점수 바 2개 */}
              <div className="score-block">
                <ScoreRow label="실사 가능성" value={realProb} tone="ok" />
                <ScoreRow label="AI 의심 신호" value={aiProb} tone="sus" rightPercent />
              </div>

              <p className="caption left-note">
                ⓘ 결과는 확률로 제공됩니다. 원본은 동의 없이 저장되지 않습니다.
              </p>
            </div>

            {/* 우측: 결론/근거/임계값 안내 */}
            <div className="result-right">
              <div className="verdict">
                <div className="title">결론 (Verdict)</div>
                <p className="desc">
                  {badge.tone === "danger" && "판단이 매우 불확실합니다. 사실 검증이 강하게 권장됩니다."}
                  {badge.tone === "warn"   && "판단이 불확실합니다. 추가적인 사실 확인이 권장됩니다."}
                  {badge.tone === "safe"   && "실제일 가능성이 높습니다. 다만 추가 확인을 권장합니다."}
                </p>
              </div>

              <div className="evidence">
                <div className="title">주요 근거</div>
                <ul>
                  <li>메타데이터/EXIF에서 편집 이력 단서 탐지 여부</li>
                  <li>픽셀 레벨 합성 경계 유사 패턴 탐지</li>
                  <li>유사 출처 고차 비교 시 동일 이미지/문구 다수 확인</li>
                </ul>
              </div>

              <div className="legend card">
                <div className="legend-title">FakeCheck 임계값</div>
                <div className="legend-body">
                  <span className="chip safe">70% 이상 → 안전</span>
                  <span className="chip warn">40% ~ 69% → 주의</span>
                  <span className="chip danger">39% 이하 → 위험</span>
                </div>
              </div>

              {/* 액션들 */}
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

/* ───── 소컴포넌트 & 유틸 ───── */

function ScoreRow({ label, value, tone = "ok", rightPercent = false }) {
  const pct = Math.round(value * 100);
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

function getBadge(aiProb, threshold) {
  if (aiProb >= Math.max(0.85, threshold + 0.1)) return { label: "위험", tone: "danger" };
  if (aiProb >= threshold) return { label: "주의", tone: "warn" };
  return { label: "안전", tone: "safe" };
}

function clamp01(n) { return Math.min(1, Math.max(0, n)); }
