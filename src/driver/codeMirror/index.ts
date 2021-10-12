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

  private async syncCursor() {
    const { line, stopQuery } = await this.context.postMessage<QueryCursorLineResponse>({
      event: 'queryCursorLine',
    });

    if (stopQuery) {
      this.stopTrackCursorLine();
    }

    if (line === null || line === this.currentLine) {
      return;
    }

    this.currentLine = line;
    this.doc.setCursor({ line: line - 1, ch: 0 });
    this.cm.focus();
  }

  trackCursorLine() {
    if (this.queryTimer) {
      return;
    }

    this.queryTimer = setInterval(this.syncCursor.bind(this), 300);
  }

  private stopTrackCursorLine() {
    if (this.queryTimer) {
      clearInterval(this.queryTimer);
      this.queryTimer = undefined;
    }
  }

  active() {
    this.syncCursor();
    this.stopTrackCursorLine();
  }

  updateCursorLine() {
    this.currentLine = this.doc.getCursor().line + 1;
    this.context.postMessage({
      event: 'updateCursorLine',
      payload: this.currentLine,
    });
  }

  inactive() {
    this.currentLine = null;
    this.context.postMessage({
      event: 'updateCursorLine',
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

          cm.on('focus', cursor.active.bind(cursor));
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
