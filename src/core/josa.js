// 받침에 맞는 조사 붙이기 — BUG-025
// josa('금창약', '이/가') → '금창약이', josa('목 베기', '을/를') → '목 베기를'
// 끝 글자가 한글이 아니면 '이(가)' 처럼 둘 다 적음
export function josa(word, pair) {
  const [withBatchim, without] = pair.split('/');
  const text = String(word);
  // 『』 같은 닫는 괄호·따옴표는 건너뛰고 마지막 글자를 봄
  const last = text.replace(/[』」』"'”’)\]\s]+$/u, '').slice(-1);
  const code = last.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return `${text}${withBatchim}(${without})`;
  return text + (code % 28 ? withBatchim : without);
}
