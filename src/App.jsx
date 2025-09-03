import { useState } from "react";
import InitView from "./features/analyze/InitView.jsx";
import LoadingView from "./features/analyze/LoadingView.jsx";
import ResultView from "./features/analyze/ResultView.jsx";
import BoardView from "./features/analyze/BoardView.jsx";
import {analyzeMock} from "./shared/api/analyze.js";
import ErrorView from "./features/ErrorView.jsx";

function App() {
  // 현재 어떤 화면을 보여줄지 상태 정하자
  const [view, setView] = useState("init");

  //사용자가 입력한 데이터 상태 
  const [form, setForm] = useState({url: "", text: "", file: null});

  //분석 결과 상태 
  const [result, setResult] = useState(null);

  //에러 뷰 
  const [errorMsg, setErrorMsg] = useState("");

  //분석 실행 
  const runAnalyze = async() => {
    if(!form.url && !form.text && !form.file) {
      return alert("입력 되지 않았습니다. ");
    }
    setView("loading");
    try {
      const data = await analyzeMock(form); // 더미 API 호출 
      setResult(data);
      setView("result");
    }catch(e) {
      console.error(e);
      setError({code: e.code || "ANAYSIS_ERROR"})
      setView("error");
    }
  };

  // 초기화 
  const reset =() => {
    setForm({url: "", text: "", file: null});
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
        onOpenBoard={()=> setView("board")} //게시판 열기 
        /> 
      )}
      {view === "loading" &&(
        <LoadingView file={form.file} onCancel={reset}/>)}
      {view === "board"   && <BoardView onBack={() => setView("init")} />}
        {view === "error" && (
          <ErrorView
            message={errorMsg}
            onBack={()=> setView("init")}
            onRetry={()=>{
              setErrorMsg("");
              runAnalyze();
            }}
            />
        )}
        {view === "result" && (
        <ResultView data={result} file={form.file} onRetry={reset} onGoBoard={() => setView("board")} />
    )}

    </>
  );
}

export default App
