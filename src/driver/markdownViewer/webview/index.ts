import { QueryWsPortRequest, MARKDOWN_SCRIPT_ID, WsMessage } from '../../constants';
import { getLine, getLineEl, getLineOfNode, isDarkTheme } from './utils';

declare const webviewApi: {
  postMessage: <T>(id: string, payload: QueryWsPortRequest) => Promise<T>;
};

const LINE_CLASS = 'better-markdown-viewer-highlight-line';
const LINE_DARK_CLASS = 'better-markdown-viewer-highlight-line-dark';

class MarkdownView {
  private isDarkTheme?: boolean;
  constructor() {
    this.initWs();
    this.monitorDblclick();
    isDarkTheme().then((value) => (this.isDarkTheme = value));
    // this.monitorSelect();
  }
  private ws?: WebSocket;
  private readonly selection = document.getSelection()!;
  private async initWs() {
    const port = await webviewApi.postMessage<number>(MARKDOWN_SCRIPT_ID, { event: 'queryWsPort' });
    this.ws = new WebSocket(`ws://127.0.0.1:${port}`);
    this.ws.addEventListener('message', async (e) => {
      const data = JSON.parse(await e.data.text());
      this.handleWsMessage(data);
    });
  }

  private highlightLine(line: number) {
    const lines = document.querySelectorAll(`.${LINE_CLASS}`);

    for (const el of lines) {
      el.classList.remove(LINE_CLASS);
      el.classList.remove(LINE_DARK_CLASS);
    }

    const lineEl = getLineEl(line);

    if (!lineEl) {
      return;
    }

    lineEl.classList.add(LINE_CLASS);

    if (this.isDarkTheme) {
      lineEl.classList.add(LINE_DARK_CLASS);
    }
  }

  private monitorDblclick() {
    document.addEventListener('dblclick', (e) => {
      const line = getLine(e.target as HTMLElement);
      this.ws?.send(
        JSON.stringify({
          from: 'md',
          event: 'moveCursor',
          payload: { line },
        }),
      );
    });
  }

  private monitorSelect() {
    document.addEventListener('selectionchange', () => {
      const { anchorNode, focusNode } = this.selection;
      const startLine = getLineOfNode(anchorNode);
      const endLine = getLineOfNode(focusNode);

      if (!startLine || !endLine) {
        return;
      }

      this.ws?.send(
        JSON.stringify({
          from: 'md',
          event: 'select',
          payload: {
            from: { line: startLine, ch: this.selection.anchorOffset },
            to: { line: endLine, ch: this.selection.focusOffset },
          },
        }),
      );
    });
  }

  //todo: broken
  private selectText(from: { line: number; ch: number }, to: { line: number; ch: number }) {
    const range = document.createRange();
    const startNode = getLineEl(from.line + 1);
    const endNode = getLineEl(to.line + 1);

    if (!startNode || !endNode) {
      return;
    }

    range.setStart(startNode, from.ch);
    range.setEnd(endNode, to.ch);

    this.selection.addRange(range);
  }

  private handleWsMessage(data: WsMessage) {
    if (data.from === 'md') {
      return;
    }

    switch (data.event) {
      case 'updateCurrentLine':
        return this.highlightLine(data.payload.line);
      // case 'select':
      //   return this.selectText(data.payload.from, data.payload.to);
      default:
        break;
    }
  }
}

new MarkdownView();
