import joplin from 'api';
import { ContentScriptType, SettingItemType } from 'api/types';
import { MARKDOWN_SCRIPT_ID, CODE_MIRROR_SCRIPT_ID, LINE_STYLE_SETTING } from '../constants';
import type { MarkdownViewerRequest } from '../markdownViewer/type';
import type { CodemirrorRequest } from '../codeMirror/type';
import data from './dataCenter';

export async function setupMarkdownViewer() {
  await joplin.contentScripts.register(
    ContentScriptType.MarkdownItPlugin,
    MARKDOWN_SCRIPT_ID,
    './driver/markdownViewer/index.js',
  );

  await joplin.contentScripts.onMessage(
    MARKDOWN_SCRIPT_ID,
    async (request: MarkdownViewerRequest) => {
      switch (request.event) {
        case 'queryCursorLine':
          return {
            line: data.currentLine,
            lineStyle: await joplin.settings.value(LINE_STYLE_SETTING),
          };
        default:
          break;
      }
    },
  );
}

export async function setupCodeMirror() {
  await joplin.contentScripts.register(
    ContentScriptType.CodeMirrorPlugin,
    CODE_MIRROR_SCRIPT_ID,
    './driver/codeMirror/index.js',
  );

  await joplin.contentScripts.onMessage(CODE_MIRROR_SCRIPT_ID, (request: CodemirrorRequest) => {
    switch (request.event) {
      case 'updateCurrentLine':
        data.currentLine = request.payload;
        break;
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
    [LINE_STYLE_SETTING]: {
      label: 'Highlight Current Line Style',
      type: SettingItemType.String,
      public: true,
      value:
        '& { position: relative; } &::before { position: absolute; background-color: rgba(255, 255, 255, 0.4); content: ""; height: 100%; width: 3px; left: -6px}',
      section: SECTION_NAME,
      description:
        'CSS statements for highlight current line. Use `&` to represent the selector of highlight line. For example: `& {background: yellow}` will make highlight line yellow. Left empty to disable highlighting',
    },
  });
}
