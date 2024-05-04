export function detectNewline(string: string): "\r\n" | "\n" | undefined {
  const newlines = string.match(/(?:\r?\n)/g) || [];

  if (newlines.length === 0) {
    return;
  }

  const crlf = newlines.filter((newline) => newline === "\r\n").length;
  const lf = newlines.length - crlf;

  return crlf > lf ? "\r\n" : "\n";
}

export function detectNewlineGraceful(string: string): "\r\n" | "\n" {
  return detectNewline(string) || "\n";
}
