// 화면이 직접 네트워크 호출을 하지 않고, API호출만 모아둔 파일 
// 우선 mock 데이터를 만들어서 반환하고 결과화면에 보여줌 
// 이후 진짜 모델 API 로 fetch 호출하고 그 응답 그대로 반환 

// export async function analyzeMock(form) {
//   // form은 { url, text, file } 구조
//   console.log("mock analyze call:", form);

//   // 1초 뒤에 가짜 결과 리턴
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       resolve({
//         success: true,
//         newsScore: 0.78, // 뉴스 진짜일 확률
//         imageScore: 0.64, // 이미지 진짜일 확률
//         reason: "샘플 결과: mock 데이터입니다.",
//       });
//     }, 1000);
//   });
// }



// 가짜 분석기 (Mock)
// 입력: { url, text, file }
// 출력: consistency, authenticity, meta → ResultView에서 사용
export async function analyzeMock({ url, text, file }) {
  console.log("mock analyze call:", { url, textLen: text?.length || 0, hasFile: !!file });

  // 로딩 효과 주기 (1초 딜레이)
  await new Promise((r) => setTimeout(r, 1000));

  // 랜덤 점수 생성
  const consistency = Math.random();
  const ai = Math.random();
  const threshold = 0.7;

  return {
    consistency: {
      score: consistency,
      label: consistency > 0.7 ? "HIGH"
           : consistency > 0.4 ? "MEDIUM"
           : "LOW",
    },
    authenticity: {
      ai_score: ai,
      threshold,
      is_ai: ai >= threshold,
    },
    meta: {
      model_consistency: "clip-mock",
      model_authenticity: "detector-mock",
      input: { hasUrl: !!url, textLen: text?.length || 0, hasFile: !!file },
    },
  };
}
