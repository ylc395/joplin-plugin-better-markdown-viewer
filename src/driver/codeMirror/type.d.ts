export type UpdateCursorLineRequest = { event: 'updateCursorLine'; payload: number | null };
export type QueryCursorLineRequest = { event: 'queryCursorLine' };
export type QueryCursorLineResponse = number | null;

export type Request = UpdateCursorLineRequest | QueryCursorLineRequest;
