export const MARKDOWN_SCRIPT_ID = 'ylc395.betterMarkdownViewer.contentScriptMarkdownIt';
export const CODE_MIRROR_SCRIPT_ID = 'ylc395.betterMarkdownViewer.contentScriptCodeMirror';

export interface QueryWsPortRequest {
  event: 'queryWsPort';
}

export interface QuerySettingRequest {
  event: 'querySetting';
  payload: { key: string; isGlobal?: boolean };
}

export interface WsMessage {
  from: 'cm' | 'md';
  event: string;
  payload: Record<string, any>;
}

export const SECTION_NAME = 'Cursor Sync';
export const BEHAVIOR_IN_VIEW_MODE = 'behaviorInViewMode';

export const PORT = 'port';

export const DEFAULT_PORT = 3000;