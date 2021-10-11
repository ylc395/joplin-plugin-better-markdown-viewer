export const HIGHLIGHT_LINE_STYLE = 'highlightLineStyle';
export const ENABLE_SYNC_TO_CM = 'enableSyncToCM';

const data: {
  currentLine: null | number;
  [HIGHLIGHT_LINE_STYLE]: string;
  [ENABLE_SYNC_TO_CM]: boolean;
  [index: string]: unknown;
} = {
  currentLine: null,
  [HIGHLIGHT_LINE_STYLE]: '',
  [ENABLE_SYNC_TO_CM]: true,
};

export default data;
