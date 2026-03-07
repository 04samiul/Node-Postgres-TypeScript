import katex from "katex";

function renderLatex(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false, output: "html" });
  } catch {
    return tex;
  }
}

export function renderMath(text: string): string {
  if (!text) return "";

  let result = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/&lt;b&gt;/gi, "<b>")
    .replace(/&lt;\/b&gt;/gi, "</b>")
    .replace(/&lt;u&gt;/gi, "<u>")
    .replace(/&lt;\/u&gt;/gi, "</u>")
    .replace(/&lt;i&gt;/gi, "<i>")
    .replace(/&lt;\/i&gt;/gi, "</i>");

  result = result.replace(/\$\$([^$]+)\$\$/g, (_, tex) =>
    renderLatex(tex.trim(), true)
  );

  result = result.replace(/\$([^$\n]+)\$/g, (_, tex) =>
    renderLatex(tex.trim(), false)
  );

  return result;
}
