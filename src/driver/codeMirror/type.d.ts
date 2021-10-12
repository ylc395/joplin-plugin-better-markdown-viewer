export type UpdateCursorLineRequest = { event: 'updateCursorLine'; payload: number | null };
export type QueryCursorLineRequest = { event: 'queryCursorLine' };
export type QueryCursorLineResponse = { line: number | null; stopQuery: boolean };

export type Request = UpdateCursorLineRequest | QueryCursorLineRequest;
