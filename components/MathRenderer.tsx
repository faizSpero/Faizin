import React, { useEffect, useRef } from 'react';
import { marked } from 'marked';

declare var katex: any;

interface MathRendererProps {
  text: string;
  className?: string;
}

const MathRenderer: React.FC<MathRendererProps> = ({ text, className }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current && typeof katex !== 'undefined') {
      // 1. Convert Markdown to HTML (handles tables, bold, etc.)
      const rawHtml = marked.parse(text) as string;

      // 2. Find and render LaTeX within the generated HTML
      // Delimiters: $$...$$ or $...$
      const renderedHtml = rawHtml.replace(/(\$\$[\s\S]*?\$\$|\$.*?\$)/g, (match) => {
        const isDisplay = match.startsWith('$$');
        const formula = isDisplay ? match.slice(2, -2) : match.slice(1, -1);
        try {
          return katex.renderToString(formula, {
            displayMode: isDisplay,
            throwOnError: false,
            trust: true,
            strict: false // Prevent compatibility warnings
          });
        } catch (e) {
          console.error("KaTeX error:", e);
          return match;
        }
      });

      containerRef.current.innerHTML = renderedHtml;
    } else if (containerRef.current) {
        containerRef.current.textContent = text;
    }
  }, [text]);

  return <div ref={containerRef} className={`${className} prose-content`} />;
};

export default MathRenderer;