// App.jsx
import { useRef, useState } from "react";
import InitView from "./features/analyze/InitView.jsx";
import LoadingView from "./features/analyze/LoadingView.jsx";
import ResultView from "./features/analyze/ResultView.jsx";
import { analyze } from "./shared/api/analyze.js";

export default function App() {
  const [view, setView] = useState("init");
  const [form, setForm] = useState({ url: "", text: "", file: null });
  const [result, setResult] = useState(null);

  // ✅ 세션 누적 통계
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    ok: 0,
    fake: 0,
    suspect: 0,
  });

  const activeJobIdRef = useRef(0);

  const runAnalyze = async (payloadFromChild) => {
    const payload = payloadFromChild ?? form;
    if (!payload.file) {
      alert("파일을 첨부해주세요.");
      return;
    }

    const jobId = ++activeJobIdRef.current;
    setView("loading");

    try {
      const data = await analyze(payload);
      if (jobId !== activeJobIdRef.current) return;

      setResult(data);

      // ✅ 위험 레벨에 따라 카운트 증가
      setSessionStats((prev) => ({
        total: prev.total + 1,
        ok: prev.ok + (data.riskLevel === "안전" ? 1 : 0),
        suspect: prev.suspect + (data.riskLevel === "주의" ? 1 : 0),
        fake: prev.fake + (data.riskLevel === "위험" ? 1 : 0),
      }));

      setView("result");
    } catch (e) {
      if (jobId !== activeJobIdRef.current) return;
      console.error(e);
      alert(e.message || "분석 실패");
      setView("init");
    }
  };

  const reset = () => {
    activeJobIdRef.current++;
    setForm({ url: "", text: "", file: null });
    setResult(null);
    setView("init");
  };

  return (
    <>
      {view === "init" && (
        <InitView
          form={form}
          setForm={setForm}
          onSubmit={runAnalyze}
          stats={sessionStats}   // ✅ 전달
        />
      )}
      {view === "loading" && (<LoadingView  file={form.file} onCancel={reset} />)}
      {view === "result" && (
        <ResultView data={result} file={form.file} onRetry={reset} />
      )}
    </>
  );
}
