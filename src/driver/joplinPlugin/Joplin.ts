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

  async queryCursorLineForMD(): Promise<MDViewerQueryCursorLineResponse> {
    const layouts = await joplin.settings.globalValue('noteVisiblePanes');

    return {
      line: this.currentLine,
      lineStyle: this.highlightLineStyle,
      noHighlight: layouts.length === 1 && layouts[0] === 'viewer',
    };
  }

  async queryCursorLineForCM(): Promise<CMQueryCursorLineResponse> {
    const layouts = await joplin.settings.globalValue('noteVisiblePanes');

    return { line: this.currentLine, stopQuery: layouts.length === 1 && layouts[0] === 'editor' };
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
    let layoutsSeq = await joplin.settings.globalValue('layoutButtonSequence');

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
    }[this[BEHAVIOR_IN_VIEW_MODE]];

    while (!canStopToggle()) {
      await joplin.commands.execute('toggleVisiblePanes');
      layouts = await joplin.settings.globalValue('noteVisiblePanes');
    }
  }

  handleUpdateCursorLineForCM(line: number | null) {
    this.currentLine = line;
  }
}
