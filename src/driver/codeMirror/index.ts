import type CodeMirror from 'codemirror';
import type { Request, QueryCursorLineResponse } from './type';

interface Context {
  postMessage: <T>(request: Request) => Promise<T>;
}

module.exports = {
  default: function (context: Context) {
    return {
      plugin: function (codemirror: typeof CodeMirror) {
        codemirror.defineOption('updateCurrentLine', false, (cm) => {
          const doc = cm.getDoc();
          let currentLine: number | null = null;

          cm.on('blur', () => {
            currentLine = null;
            context.postMessage({
              event: 'updateCurrentLine',
              payload: null,
            });
          });

          cm.on('cursorActivity', () => {
            currentLine = doc.getCursor().line + 1;
            context.postMessage({
              event: 'updateCurrentLine',
              payload: currentLine,
            });
          });

          setInterval(async () => {
            const _line = await context.postMessage<QueryCursorLineResponse>({
              event: 'queryCursorLine',
            });

            if (_line === null) {
              return;
            }

            const line = _line - 1;

            if (line === currentLine) {
              return;
            }

            doc.setCursor({ line, ch: 0 });
            cm.focus();
          }, 300);
        });
      },
      codeMirrorOptions: {
        updateCurrentLine: true,
      },
    };
  },
};
