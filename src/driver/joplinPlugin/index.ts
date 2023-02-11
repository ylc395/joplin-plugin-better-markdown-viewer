import joplin from 'api';
import { ContentScriptType } from 'api/types';
import {
  MARKDOWN_SCRIPT_ID,
  CODE_MIRROR_SCRIPT_ID,
  QueryWsPortRequest,
  QuerySettingRequest,
  BEHAVIOR_IN_VIEW_MODE,
  PORT,
  SECTION_NAME,
  DEFAULT_PORT,
} from '../constants';
import setting, { Behaviors } from './setting';
import { nextAvailable } from 'node-port-check';
import { OPEN, WebSocketServer } from 'ws';

export default class App {
  private port = DEFAULT_PORT;

  private async startWs() {
    const port =  await joplin.settings.value(PORT)
    this.port = await nextAvailable(port);
    const wss = new WebSocketServer({ port: this.port });

    wss.on('connection', (ws) => {
      ws.on('message', (message) => {
        wss.clients.forEach((client) => {
          if (client.readyState === OPEN) {
            client.send(message);
          }
        });

        const data = JSON.parse(message.toString());
        if (data.from === 'md' && data.event === 'moveCursor') {
          this.toggleEditorOut();
        }
      });
    });
  }

  async init() {
    await this.setupSetting();
    await this.startWs();
    await this.setupCodeMirror();
    await this.setupMarkdownViewer();
  }

  private async setupMarkdownViewer() {
    await joplin.contentScripts.register(
      ContentScriptType.MarkdownItPlugin,
      MARKDOWN_SCRIPT_ID,
      './driver/markdownViewer/index.js',
    );

    await joplin.contentScripts.onMessage(MARKDOWN_SCRIPT_ID, this.handleRequest.bind(this));
  }

  private async setupCodeMirror() {
    await joplin.contentScripts.register(
      ContentScriptType.CodeMirrorPlugin,
      CODE_MIRROR_SCRIPT_ID,
      './driver/codeMirror/index.js',
    );

    await joplin.contentScripts.onMessage(CODE_MIRROR_SCRIPT_ID, this.handleRequest.bind(this));
  }

  private async setupSetting() {
    await joplin.settings.registerSection(SECTION_NAME, {
      label: 'Cursor Sync',
    });

    await joplin.settings.registerSettings(setting);
  }

  private handleRequest(request: QueryWsPortRequest | QuerySettingRequest) {
    switch (request.event) {
      case 'queryWsPort':
        return this.port;
      case 'querySetting':
        return request.payload.isGlobal
          ? joplin.settings.globalValue(request.payload.key)
          : joplin.settings.value(request.payload.key);
      default:
        break;
    }
  }

  private async toggleEditorOut() {
    let layouts = await joplin.settings.globalValue('noteVisiblePanes');
    let layoutsSeq = await joplin.settings.globalValue('layoutButtonSequence');
    const behavior: Behaviors = await joplin.settings.value(BEHAVIOR_IN_VIEW_MODE);

    const isInViewMode = layouts.length === 1 && layouts[0] === 'viewer';

    if (!isInViewMode) {
      return;
    }

    const canStopToggle = {
      [Behaviors.None]: () => true,
      [Behaviors.Editor]: () =>
        (layoutsSeq === 3 && layouts.length === 2) || // @see https://github.com/laurent22/joplin/blob/cbfc646745f2774fbe89e30c8020cfe5e6465545/packages/lib/models/Setting.ts#L155
        (layouts.length === 1 && layouts[0] === 'editor'),
      [Behaviors.EditorView]: () =>
        (layoutsSeq === 1 && layouts.length === 1 && layouts[0] === 'editor') || // @see https://github.com/laurent22/joplin/blob/cbfc646745f2774fbe89e30c8020cfe5e6465545/packages/lib/models/Setting.ts#L155
        layouts.length === 2,
    }[behavior];

    while (!canStopToggle()) {
      await joplin.commands.execute('toggleVisiblePanes');
      layouts = await joplin.settings.globalValue('noteVisiblePanes');
    }
  }
}
