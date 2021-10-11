import type { QueryCursorLineResponse as MDViewerQueryCursorLineResponse } from '../markdownViewer/type';
import type { QueryCursorLineResponse as CMQueryCursorLineResponse } from '../codeMirror/type';
import joplin from 'api';

export const HIGHLIGHT_LINE_STYLE = 'highlightLineStyle';
export const ENABLE_SYNC_TO_CM = 'enableSyncToCM';
export const TO_OPEN_EDITOR = 'toOpenEditor';

export default class Joplin {
  currentLine: number | null = null;
  private [HIGHLIGHT_LINE_STYLE] = '';
  private [ENABLE_SYNC_TO_CM] = true;
  private [TO_OPEN_EDITOR] = true;
  update(key: string, value: any) {
    if (key in this) {
      this[key as keyof this] = value;
    }
  }

  queryCursorLineForMD(): MDViewerQueryCursorLineResponse {
    return {
      line: this.currentLine,
      lineStyle: this.highlightLineStyle,
    };
  }

  queryCursorLineForCM(): CMQueryCursorLineResponse {
    return this.currentLine;
  }

  async handleUpdateCursorLineForMD(line: number | null) {
    if (!this[ENABLE_SYNC_TO_CM]) {
      return;
    }

    this.currentLine = line;

    if (this[TO_OPEN_EDITOR]) {
      await this.toggleEditorOut();
    }
  }

  private async toggleEditorOut() {
    let layouts = await joplin.settings.globalValue('noteVisiblePanes');

    while (layouts.length !== 2) {
      await joplin.commands.execute('toggleVisiblePanes');
      layouts = await joplin.settings.globalValue('noteVisiblePanes');
    }
  }

  handleUpdateCursorLineForCM(line: number | null) {
    this.currentLine = line;
  }
}
