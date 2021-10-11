export type UpdateCurrentLineRequest = { event: 'updateCurrentLine'; payload: number | null };
export type QueryCursorLineRequest = { event: 'queryCursorLine' };
export type QueryCursorLineResponse = number | null;

export type Request = UpdateCurrentLineRequest | QueryCursorLineRequest;
