export function highlightConfirm(text: string): string {
  if (!text) return "";
  const esc = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return esc.replace(
    /\[CONFIRMAR:[^\]]*\]/g,
    (m) => `<span class="confirm-tag">${m}</span>`
  );
}

export function hasUnresolvedConfirm(text: string) {
  return /\[CONFIRMAR:[^\]]*\]/.test(text || "");
}
