import Dexie, { type EntityTable } from "dexie";
import type { CouncilRun } from "../shared/types";

class CouncilDatabase extends Dexie {
  runs!: EntityTable<CouncilRun, "id">;
  constructor() { super("CouncilDatabase"); this.version(1).stores({ runs: "id, status, mode, createdAt, updatedAt, *selectedProviders" }); }
}
export const councilDatabase = new CouncilDatabase();
