import { Fragment } from "react";

// Renderiza el texto del tutor: párrafos, listas con "- " y **negritas**.
// No usa HTML crudo, así que el texto del modelo nunca se inyecta como markup.
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    )
  );
}

export function RichText({ text }: { text: string }) {
  const blocks: { type: "p" | "ul"; lines: string[] }[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line) continue;
    const isItem = /^[-•*]\s+/.test(line);
    const content = isItem ? line.replace(/^[-•*]\s+/, "") : line;
    const last = blocks.at(-1);
    if (isItem && last?.type === "ul") last.lines.push(content);
    else blocks.push({ type: isItem ? "ul" : "p", lines: [content] });
  }
  return (
    <div className="space-y-2">
      {blocks.map((b, i) =>
        b.type === "ul" ? (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.lines.map((l, j) => (
              <li key={j}>{inline(l)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{inline(b.lines[0])}</p>
        )
      )}
    </div>
  );
}
