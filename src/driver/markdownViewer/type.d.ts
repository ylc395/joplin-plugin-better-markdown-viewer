export type QueryCursorLineRequest = { event: 'queryCursorLine' };
export interface QueryCursorLineResponse {
  line: number | null;
  lineStyle: string;
  noHighlight: boolean;
}

export type UpdateCursorLineRequest = { event: 'updateCursorLine'; payload: number | null };

export type Request = QueryCursorLineRequest | UpdateCursorLineRequest;
