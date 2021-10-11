import type { QueryCursorLineResponse as MDViewerQueryCursorLineResponse } from '../markdownViewer/type';
import type { QueryCursorLineResponse as CMQueryCursorLineResponse } from '../codeMirror/type';
import joplin from 'api';

export const HIGHLIGHT_LINE_STYLE = 'highlightLineStyle';
export const ENABLE_SYNC_TO_CM = 'enableSyncToCM';
export const BEHAVIOR_IN_VIEW_MODE = 'behaviorInViewMode';

export enum Behaviors {
  None,
  Editor,
  EditorView,
}

export default class Joplin {
  currentLine: number | null = null;
  private [HIGHLIGHT_LINE_STYLE] = '';
  private [ENABLE_SYNC_TO_CM] = true;
  private [BEHAVIOR_IN_VIEW_MODE]: Behaviors = Behaviors.None;
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

    await this.toggleEditorOut();
  }

  private async toggleEditorOut() {
    let layouts = await joplin.settings.globalValue('noteVisiblePanes');

    const canStopToggle = {
      [Behaviors.None]: () => true,
      [Behaviors.Editor]: () => layouts.length === 1 && layouts[0] === 'editor',
      [Behaviors.EditorView]: () => layouts.length === 2,
    }[this[BEHAVIOR_IN_VIEW_MODE]];

    while (!canStopToggle()) {
      await joplin.commands.execute('toggleVisiblePanes');
      layouts = await joplin.settings.globalValue('noteVisiblePanes');
      console.log(layouts);
    }
  }

  handleUpdateCursorLineForCM(line: number | null) {
    this.currentLine = line;
  }
}
