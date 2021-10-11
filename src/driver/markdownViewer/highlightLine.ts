import { MARKDOWN_SCRIPT_ID } from '../constants';
import type { MarkdownViewerRequest } from './type';

const LINE_CLASS = 'better-markdown-viewer-highlight-line';
declare const webviewApi: {
  postMessage: (
    id: string,
    payload: MarkdownViewerRequest,
  ) => Promise<{ line: number | null; lineStyle: string }>;
};

const styleEl = document.createElement('style');
document.head.appendChild(styleEl);
function refreshLineStyle(style: string) {
  styleEl.innerHTML = `.${LINE_CLASS} { ${style} }`;
}

function getLineEl(line: number) {
  for (let i = line; i >= 1; i--) {
    const el = document.querySelector(`[data-source-line="${i}"]`);

    if (el) {
      if (el.tagName === 'CODE' && el.parentElement && el.parentElement.tagName === 'PRE') {
        // Fenched code blocks are a special case since the `code-line` can only be marked on
        // the `<code>` element and not the parent `<pre>` element.
        return { el: el.parentElement, line: i };
      }

      return { el: el as HTMLElement, line: i };
    }
  }

  return null;
}

function clearHighlight() {
  const lines = document.querySelectorAll(`.${LINE_CLASS}`);

  for (const el of lines) {
    el.classList.remove(LINE_CLASS);
  }
}

let lastHighLightLine: null | number = null;
let lastHighLightLineStyle: null | string = null;

async function highlightLine() {
  const { line: lineNum, lineStyle } = await webviewApi.postMessage(MARKDOWN_SCRIPT_ID, {
    event: 'queryCursorLine',
  });

  if (lineStyle !== lastHighLightLineStyle) {
    lastHighLightLineStyle = lineStyle;
    refreshLineStyle(lineStyle);
  }

  if (!lineNum) {
    clearHighlight();
    return;
  }

  const lineInfo = getLineEl(lineNum);

  if (!lineInfo) {
    clearHighlight();
    return;
  }

  if (lineInfo.line !== lastHighLightLine) {
    clearHighlight();
    lastHighLightLine = lineInfo.line;
    lineInfo.el.classList.add(LINE_CLASS);
  }
}

setInterval(highlightLine, 300);
