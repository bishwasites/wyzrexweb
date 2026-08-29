// Deliberately not a real markdown parser — the brief asked for "a plain
// textarea with markdown rendered via a small renderer", not a dependency.
// Supports the handful of things an editor actually reaches for in a body
// field: paragraphs (blank-line separated), **bold**, and *italic*.
function renderInline(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>");
}

export default function Markdown({ text, className }: { text: string; className?: string }) {
  const paragraphs = text.split(/\n{2,}/).filter((p) => p.trim());
  return (
    <div className={className}>
      {paragraphs.map((p, i) => (
        // eslint-disable-next-line react/no-danger
        <p key={i} dangerouslySetInnerHTML={{ __html: renderInline(p.trim()) }} />
      ))}
    </div>
  );
}
