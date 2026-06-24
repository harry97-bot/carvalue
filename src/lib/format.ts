export const manwon = (v: number) => `${v.toLocaleString("ko-KR")}만원`;
export const num = (v: number) => v.toLocaleString("ko-KR");

export function votePercent(a: number, b: number): { a: number; b: number } {
  const total = a + b;
  if (total === 0) return { a: 50, b: 50 };
  const pa = Math.round((a / total) * 100);
  return { a: pa, b: 100 - pa };
}
