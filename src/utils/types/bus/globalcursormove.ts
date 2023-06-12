import { DomainTuple } from "victory";

export class BusConstants {
  static readonly ZOOM_DOMAIN_CHANGE = "zoom-domain-change";

  static readonly CURSOR_MOVE = "cursor-move";
}

export interface GlobalCursorMove {
  cursorX: number | null;
  zoomdomain: { x: DomainTuple; y: DomainTuple } | null;
}
