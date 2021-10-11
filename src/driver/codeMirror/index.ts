import type CodeMirror from 'codemirror';
import { CodemirrorRequest } from './type';

interface Context {
  postMessage: (payload: CodemirrorRequest) => Promise<void>;
}

module.exports = {
  default: function (context: Context) {
    return {
      plugin: function (codemirror: typeof CodeMirror) {
        codemirror.defineOption('updateCurrentLine', false, (cm) => {
          const doc = cm.getDoc();

          cm.on('blur', () => {
            context.postMessage({
              event: 'updateCurrentLine',
              payload: null,
            });
          });
          cm.on('cursorActivity', () => {
            context.postMessage({
              event: 'updateCurrentLine',
              payload: doc.getCursor().line + 1,
            });
          });
        });
      },
      codeMirrorOptions: {
        updateCurrentLine: true,
      },
    };
  },
};
