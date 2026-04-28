export function excerpt(text?: string | null, n = 140) {
  if (!text) return '';
  let t = String(text);

  // Remove Markdown formatting
  t = t.replace(/(\*\*|__)(.*?)\1/g, '$2'); // bold
  t = t.replace(/(\*|_)(.*?)\1/g, '$2'); // italic
  t = t.replace(/!\[(.*?)\]\(.*?\)/g, '$1'); // images
  t = t.replace(/\[(.*?)\]\(.*?\)/g, '$1'); // links
  t = t.replace(/#+\s+(.*)/g, '$1'); // headers
  t = t.replace(/>\s+(.*)/g, '$1'); // blockquotes
  t = t.replace(/`{1,3}(.*?)`{1,3}/g, '$1'); // inline code and code blocks
  t = t.replace(/~{2}(.*?)~{2}/g, '$1'); // strikethrough
  t = t.replace(/\n+/g, ' '); // newlines to spaces
  t = t.replace(/\s+/g, ' ').trim(); // multiple spaces to single space

  return t.length > n ? t.slice(0, n).trim() + '…' : t;
}
