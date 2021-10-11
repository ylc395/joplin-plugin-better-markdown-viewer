export type QueryCursorLineRequest = { event: 'queryCursorLine' };
export interface QueryCursorLineResponse {
  line: number | null;
  lineStyle: string;
}

export type UpdateCursorLineRequest = { event: 'updateCursorLine'; payload: number | null };

export type Request = QueryCursorLineRequest | UpdateCursorLineRequest;
