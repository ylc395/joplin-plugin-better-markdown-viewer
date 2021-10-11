import joplin from 'api';
import { ContentScriptType, SettingItemType } from 'api/types';
import { MARKDOWN_SCRIPT_ID, CODE_MIRROR_SCRIPT_ID } from '../constants';
import type {
  Request as MarkdownViewerRequest,
  QueryCursorLineResponse as MDViewerQueryCursorLineResponse,
} from '../markdownViewer/type';
import type {
  Request as CodeMirrorRequest,
  QueryCursorLineResponse as CMQueryCursorLineResponse,
} from '../codeMirror/type';
import globalData, { HIGHLIGHT_LINE_STYLE, ENABLE_SYNC_TO_CM } from './globals';

export async function setupMarkdownViewer() {
  await joplin.contentScripts.register(
    ContentScriptType.MarkdownItPlugin,
    MARKDOWN_SCRIPT_ID,
    './driver/markdownViewer/index.js',
  );

  await joplin.contentScripts.onMessage(MARKDOWN_SCRIPT_ID, (request: MarkdownViewerRequest) => {
    switch (request.event) {
      case 'queryCursorLine':
        return {
          line: globalData.currentLine,
          lineStyle: globalData.highlightLineStyle,
        } as MDViewerQueryCursorLineResponse;
      case 'updateCursorLine':
        if (globalData[ENABLE_SYNC_TO_CM]) {
          globalData.currentLine = request.payload;
        }
        return;
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
      case 'updateCurrentLine':
        globalData.currentLine = request.payload;
        break;
      case 'queryCursorLine':
        return globalData.currentLine as CMQueryCursorLineResponse;
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
      value:
        '& { position: relative; } &::before { position: absolute; background-color: rgba(255, 255, 255, 0.4); content: ""; height: 100%; width: 3px; left: -6px}',
      section: SECTION_NAME,
      description:
        'CSS statements for highlight current line. Use `&` to represent the selector of highlight line. For example: `& {background: yellow}` will make highlight line yellow. Left empty to disable highlighting',
    },
    [ENABLE_SYNC_TO_CM]: {
      label: 'Double click to Switch To Editor',
      type: SettingItemType.Bool,
      public: true,
      value: true,
      section: SECTION_NAME,
    },
  });

  globalData[HIGHLIGHT_LINE_STYLE] = await joplin.settings.value(HIGHLIGHT_LINE_STYLE);
  globalData[ENABLE_SYNC_TO_CM] = await joplin.settings.value(ENABLE_SYNC_TO_CM);

  await joplin.settings.onChange(async ({ keys }) => {
    for (const key of keys) {
      globalData[key] = await joplin.settings.value(key);
    }
  });
}
