import type CodeMirror from 'codemirror';
import type { Editor } from 'codemirror';
import type { Request, QueryCursorLineResponse } from './type';

interface Context {
  postMessage: <T>(request: Request) => Promise<T>;
}

class Cursor {
  constructor(private readonly context: Context, private readonly cm: Editor) {}
  private currentLine: number | null = null;
  private readonly doc = this.cm.getDoc();
  private queryTimer?: ReturnType<typeof setInterval>;
  trackCursorLine() {
    if (this.queryTimer) {
      return;
    }

    this.queryTimer = setInterval(async () => {
      const _line = await this.context.postMessage<QueryCursorLineResponse>({
        event: 'queryCursorLine',
      });

      if (_line === null) {
        return;
      }

      const line = _line - 1;

      if (line === this.currentLine) {
        return;
      }

      this.doc.setCursor({ line, ch: 0 });
      this.cm.focus();
    }, 300);
  }

  stopTrackCursorLine() {
    if (this.queryTimer) {
      clearInterval(this.queryTimer);
    }
  }

  updateCursorLine() {
    this.currentLine = this.doc.getCursor().line + 1;
    this.context.postMessage({
      event: 'updateCurrentLine',
      payload: this.currentLine,
    });
  }

  inactive() {
    this.currentLine = null;
    this.context.postMessage({
      event: 'updateCurrentLine',
      payload: null,
    });
  }
}

module.exports = {
  default: function (context: Context) {
    return {
      plugin: function (codemirror: typeof CodeMirror) {
        codemirror.defineOption('updateCurrentLine', false, (cm) => {
          const cursor = new Cursor(context, cm);
          cursor.trackCursorLine();

          cm.on('focus', cursor.stopTrackCursorLine.bind(cursor));
          cm.on('blur', cursor.inactive.bind(cursor));
          cm.on('blur', cursor.trackCursorLine.bind(cursor));
          cm.on('cursorActivity', cursor.updateCursorLine.bind(cursor));
        });
      },
      codeMirrorOptions: {
        updateCurrentLine: true,
      },
    };
  },
};
