// 프록시 없이 직접 호출 (CORS는 서버에서 허용됨)
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

/**
 * 이미지 분석 API 호출
 * @param {{file: File}} payload
 * @returns {Promise<object>} 표준화된 결과 JSON
 */
export async function analyze(payload) {
  if (!payload?.file) {
    throw new Error("이미지 파일이 없습니다.");
  }

  const formData = new FormData();
  formData.append("image", payload.file); // 백엔드 필드명과 일치해야 함

  // 타임아웃/취소
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), 30_000);

  try {
    const res = await fetch(`${BASE_URL}/analysis`, {
      method: "POST",
      body: formData,
      signal: ctrl.signal,
    });

    if (!res.ok) {
      let info = null;
      try { info = await res.json(); } catch {}
      const msg = info?.message || `서버 오류(${res.status})`;
      const err = new Error(msg);
      err.code = info?.errorCode || "SERVER_ERROR";
      throw err;
    }

    const data = await res.json();
    return data?.results ?? data; // 표준화
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("요청이 시간 초과되었습니다. 네트워크를 확인해주세요.");
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

console.log("API Base:", BASE_URL);
