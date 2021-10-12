import { MARKDOWN_SCRIPT_ID } from '../constants';
import type { QueryCursorLineRequest, QueryCursorLineResponse } from './type';

const LINE_CLASS = 'better-markdown-viewer-highlight-line';
declare const webviewApi: {
  postMessage: (id: string, payload: QueryCursorLineRequest) => Promise<QueryCursorLineResponse>;
};

const styleEl = document.createElement('style');
document.head.appendChild(styleEl);
function refreshLineStyle(style: string) {
  styleEl.textContent = style.replaceAll('&', `.${LINE_CLASS}`);
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

let lastHighLightLine: null | number = null;
let lastHighLightLineStyle: null | string = null;

function clearHighlight() {
  const lines = document.querySelectorAll(`.${LINE_CLASS}`);
  lastHighLightLine = null;

  for (const el of lines) {
    el.classList.remove(LINE_CLASS);
  }
}

async function highlightLine() {
  const {
    line: lineNum,
    lineStyle,
    noHighlight,
  } = await webviewApi.postMessage(MARKDOWN_SCRIPT_ID, {
    event: 'queryCursorLine',
  });

  if (lineStyle !== lastHighLightLineStyle) {
    lastHighLightLineStyle = lineStyle;
    refreshLineStyle(lineStyle);
  }

  if (noHighlight) {
    clearHighlight();
  }

  if (!lineNum) {
    return;
  }

  const lineInfo = getLineEl(lineNum);

  if (!lineInfo) {
    clearHighlight();
    return;
  }

  if (lineInfo.line !== lastHighLightLine) {
    clearHighlight();

    if (!noHighlight) {
      lastHighLightLine = lineInfo.line;
      lineInfo.el.classList.add(LINE_CLASS);
    }
  }
}

// in markdown view, there is no choice but to keep querying
// because there is no chance to restart to query
setInterval(highlightLine, 300);
