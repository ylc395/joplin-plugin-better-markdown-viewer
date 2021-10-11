import joplin from 'api';
import { ContentScriptType, SettingItemType } from 'api/types';
import { MARKDOWN_SCRIPT_ID, CODE_MIRROR_SCRIPT_ID } from '../constants';
import type { Request as MarkdownViewerRequest } from '../markdownViewer/type';
import type { Request as CodeMirrorRequest } from '../codeMirror/type';
import Joplin, {
  HIGHLIGHT_LINE_STYLE,
  ENABLE_SYNC_TO_CM,
  BEHAVIOR_IN_VIEW_MODE,
  Behaviors,
} from './Joplin';

const app = new Joplin();

export async function setupMarkdownViewer() {
  await joplin.contentScripts.register(
    ContentScriptType.MarkdownItPlugin,
    MARKDOWN_SCRIPT_ID,
    './driver/markdownViewer/index.js',
  );

  await joplin.contentScripts.onMessage(MARKDOWN_SCRIPT_ID, (request: MarkdownViewerRequest) => {
    switch (request.event) {
      case 'queryCursorLine':
        return app.queryCursorLineForMD();
      case 'updateCursorLine':
        return app.handleUpdateCursorLineForMD(request.payload);
      default:
        break;
    }
  });
}

export async function setupCodeMirror() {
  await joplin.contentScripts.register(
    ContentScriptType.CodeMirrorPlugin,
    CODE_MIRROR_SCRIPT_ID,
    './driver/codeMirror/index.js',
  );

  await joplin.contentScripts.onMessage(CODE_MIRROR_SCRIPT_ID, (request: CodeMirrorRequest) => {
    switch (request.event) {
      case 'updateCursorLine':
        return app.handleUpdateCursorLineForCM(request.payload);
      case 'queryCursorLine':
        return app.queryCursorLineForCM();
      default:
        break;
    }
  });
}

export async function setupSetting() {
  const SECTION_NAME = 'Better MD Viewer';

  await joplin.settings.registerSection(SECTION_NAME, {
    label: 'Better MD Viewer',
  });

  await joplin.settings.registerSettings({
    [HIGHLIGHT_LINE_STYLE]: {
      label: 'Highlight Current Line Style',
      type: SettingItemType.String,
      public: true,
      value: '& {background: #FDFFBC}',
      section: SECTION_NAME,
      description:
        'CSS statements for highlight current line. Use `&` to represent the selector of highlight line. For example: `& {background: yellow}` will make highlight line yellow. Left empty to disable highlighting',
    },
    [ENABLE_SYNC_TO_CM]: {
      label: 'Double click to Switch To Editor when in Split View layout',
      type: SettingItemType.Bool,
      public: true,
      value: true,
      section: SECTION_NAME,
    },
    [BEHAVIOR_IN_VIEW_MODE]: {
      label: 'What happen when double clicking In Viewer layout',
      isEnum: true,
      options: {
        [Behaviors.None]: 'Nothing happens',
        [Behaviors.Editor]: 'Toggle out Editor',
        [Behaviors.EditorView]: 'Toggle out Editor-View',
      },
      type: SettingItemType.Int,
      public: true,
      value: Behaviors.EditorView,
      section: SECTION_NAME,
      description:
        "If your layout button sequence doesn't include the layout, this option won't take effect",
    },
  });

  app.update(HIGHLIGHT_LINE_STYLE, await joplin.settings.value(HIGHLIGHT_LINE_STYLE));
  app.update(ENABLE_SYNC_TO_CM, await joplin.settings.value(ENABLE_SYNC_TO_CM));
  app.update(BEHAVIOR_IN_VIEW_MODE, await joplin.settings.value(BEHAVIOR_IN_VIEW_MODE));

  await joplin.settings.onChange(async ({ keys }) => {
    for (const key of keys) {
      app.update(key, await joplin.settings.value(key));
    }
  });
}
