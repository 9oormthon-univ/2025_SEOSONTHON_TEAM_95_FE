

export default function BoardView({ onBack }) {
  return (
    <div>
      <h1>게시판</h1>
      <button onClick={onBack}>← 돌아가기</button>
    </div>
  );
}
