import type { CouncilRun } from "../shared/types";
import { councilDatabase } from "./database";

export async function saveCouncilRun(councilRun: CouncilRun): Promise<void> { await councilDatabase.runs.put(councilRun); }
export async function listCouncilRuns(): Promise<CouncilRun[]> { return councilDatabase.runs.orderBy("updatedAt").reverse().toArray(); }
export async function deleteCouncilRun(runId: string): Promise<void> { await councilDatabase.runs.delete(runId); }
