export type CommentSpan = { start: number; end: number };

/**
 * 보수적으로 주석 구간만 추출합니다. 불확실하면 빈 배열을 반환합니다.
 */
export function extractCommentSpans(source: string): CommentSpan[] {
  const spans: CommentSpan[] = [];
  const lines = source.split(/\n/);
  let offset = 0;

  for (let li = 0; li < lines.length; li++) {
    const line = lines[li]!;
    const lineStart = offset;
    offset += line.length + 1;

    const trimmed = line.trimStart();
    const indent = line.length - trimmed.length;

    if (trimmed.startsWith("//")) {
      spans.push({
        start: lineStart + indent,
        end: lineStart + line.length,
      });
      continue;
    }
    if (trimmed.startsWith("#") && !trimmed.startsWith("#!")) {
      spans.push({
        start: lineStart + indent,
        end: lineStart + line.length,
      });
      continue;
    }
    if (trimmed.startsWith("--")) {
      spans.push({
        start: lineStart + indent,
        end: lineStart + line.length,
      });
    }
  }

  const block = extractBlockComments(source);
  spans.push(...block);

  return mergeSpans(spans);
}

function extractBlockComments(source: string): CommentSpan[] {
  const spans: CommentSpan[] = [];
  const re = /\/\*[\s\S]*?\*\//g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source)) !== null) {
    spans.push({ start: m.index, end: m.index + m[0].length });
  }
  return spans;
}

function mergeSpans(spans: CommentSpan[]): CommentSpan[] {
  if (!spans.length) return [];
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const out: CommentSpan[] = [];
  let cur = sorted[0]!;
  for (let i = 1; i < sorted.length; i++) {
    const s = sorted[i]!;
    if (s.start <= cur.end) {
      cur = { start: cur.start, end: Math.max(cur.end, s.end) };
    } else {
      out.push(cur);
      cur = s;
    }
  }
  out.push(cur);
  return out;
}
