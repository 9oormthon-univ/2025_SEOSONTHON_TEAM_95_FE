const ERROR_MAP = {
  NETWORK: {
    icon: "📡",
    title: "네트워크 연결이 불안정합니다",
    desc: "연결을 확인한 뒤 다시 시도해 주세요. 문제가 지속되면 잠시 후 다시 시도해 주세요.",
    actions: ["retry", "back"]
  },
  CONTENT_LOAD: {
    icon: "⚠️",
    title: "콘텐츠를 불러오는 중 문제가 발생했습니다",
    desc: "기사 본문을 불러오지 못했습니다. 접근 권한 또는 로봇 차단 여부를 확인해 주세요.",
    actions: ["retry"]
  },
  UNSUPPORTED_FORMAT: {
    icon: "📄",
    title: "지원되지 않는 형식입니다",
    desc: "지원되지 않는 형식입니다. JPG/PNG 또는 일반 기사 URL을 사용해 주세요.",
    actions: ["back"]
  },
  ANALYSIS_ERROR: {
    icon: "❌",
    title: "분석 중 오류가 발생했습니다",
    desc: "잠시 후 다시 시도해 주세요. 문제가 계속되면 피드백을 보내 주세요.",
    actions: ["retry", "back"]
  }
};

export default function ErrorView({ error, onBack, onRetry }) {
  const config = ERROR_MAP[error.code] || ERROR_MAP.ANALYSIS_ERROR;

  return (
    <div className="error-card">
      <div className="error-icon">{config.icon}</div>
      <h2>{config.title}</h2>
      <p>{config.desc}</p>
      <p className="caption">원본은 동의 없이 저장되지 않습니다. 결과는 확률로 제공됩니다.</p>
      <div className="error-actions">
        {config.actions.includes("back") && (
          <button onClick={onBack}>뒤로가기</button>
        )}
        {config.actions.includes("retry") && (
          <button onClick={onRetry}>다시 시도</button>
        )}
      </div>
    </div>
  );
}
