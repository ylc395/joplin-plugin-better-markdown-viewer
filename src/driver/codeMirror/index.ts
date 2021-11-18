import type CodeMirror from 'codemirror';
import type { Editor, EditorSelectionChange, Position } from 'codemirror';
import { QueryWsPortRequest, WsMessage } from '../constants';

interface Context {
  postMessage: <T>(request: QueryWsPortRequest) => Promise<T>;
}

class Cursor {
  constructor(private readonly context: Context, private readonly cm: Editor) {
    this.init();
  }
  private currentLine: number | null = null;
  private readonly doc = this.cm.getDoc();
  private ws?: WebSocket;
  private async init() {
    const port = await this.context.postMessage<number>({ event: 'queryWsPort' });
    this.ws = new WebSocket(`ws://127.0.0.1:${port}`);
    this.ws.addEventListener('message', async (e) => {
      const data = JSON.parse(await e.data.text());
      this.handleWsMessage(data);
    });
  }

  private handleWsMessage(data: WsMessage) {
    if (data.from === 'cm') {
      return;
    }

    switch (data.event) {
      case 'moveCursor':
        return this.moveCursorToLine(data.payload.line);
      case 'select':
        return this.selectText(data.payload.from, data.payload.to);
      default:
        break;
    }
  }

  reportSelection(_: unknown, selection: EditorSelectionChange) {
    const range = selection.ranges[0];
    this.ws?.send(
      JSON.stringify({
        from: 'cm',
        event: 'select',
        payload: {
          from: range.from(),
          to: range.to(),
        },
      }),
    );
  }

  updateCursorLine() {
    const currentLine = this.doc.getCursor().line + 1;

    if (currentLine === this.currentLine) {
      return;
    }

    this.currentLine = currentLine;
    this.ws!.send(
      JSON.stringify({
        from: 'cm',
        event: 'updateCurrentLine',
        payload: { line: currentLine },
      }),
    );
  }

  private selectText(from: Position, to: Position) {
    console.log(from, to);

    this.doc.setSelection(
      {
        line: from.line - 1,
        ch: from.ch,
      },
      {
        line: to.line - 1,
        ch: to.ch,
      },
    );
    this.cm.focus();
  }

  private moveCursorToLine(line: number) {
    this.doc.setCursor({ line: line - 1, ch: 0 });
    this.cm.focus();
    this.updateCursorLine();
  }
}

export default function (context: Context) {
  return {
    plugin: function (codemirror: typeof CodeMirror) {
      codemirror.defineOption('updateCurrentLine', false, (cm) => {
        const cursor = new Cursor(context, cm);
        cm.on('cursorActivity', cursor.updateCursorLine.bind(cursor));
        // cm.on('beforeSelectionChange', cursor.reportSelection.bind(cursor));
      });
    },
    codeMirrorOptions: {
      updateCurrentLine: true,
    },
  };
}
