import joplin from 'api';
import { setupCodeMirror, setupMarkdownViewer, setupSetting } from './driver/joplinPlugin';

joplin.plugins.register({
  onStart: async function () {
    await setupSetting();
    await setupCodeMirror();
    await setupMarkdownViewer();
  },
});
