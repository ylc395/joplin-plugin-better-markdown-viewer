import { MARKDOWN_SCRIPT_ID } from '../constants';
import type { UpdateCursorLineRequest } from './type';

declare const webviewApi: {
  postMessage: (id: string, payload: UpdateCursorLineRequest) => Promise<void>;
};

function getLine(el: HTMLElement): number | null {
  if (el.dataset.sourceLine) {
    return Number(el.dataset.sourceLine);
  }

  if (!el.parentElement) {
    return null;
  }

  return getLine(el.parentElement);
}

document.addEventListener('dblclick', (e) => {
  const line = getLine(e.target as HTMLElement);

  webviewApi.postMessage(MARKDOWN_SCRIPT_ID, { event: 'updateCursorLine', payload: line });
});
