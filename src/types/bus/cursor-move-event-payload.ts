export type CursorMoveEventPayload = {
  x: number | null; // x coordinate of the cursor
  viewId: string; // viewId of the view that is dispatching the event
};
