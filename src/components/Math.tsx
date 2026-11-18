"use client";
import katex from "katex";

export function MathTex({ tex, block = true }: { tex: string; block?: boolean }) {
  const html = katex.renderToString(tex, { throwOnError: false, displayMode: block });
  return <span className={block ? "block overflow-x-auto py-2 text-xl" : ""} dangerouslySetInnerHTML={{ __html: html }} />;
}
