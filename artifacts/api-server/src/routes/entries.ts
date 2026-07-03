import { randomUUID } from "crypto";
import { Router, type IRouter } from "express";
import {
  CreateEntryBody,
  ListEntriesResponse,
  CreateEntryResponse,
} from "@workspace/api-zod";
import { appendEntry, listEntries, resultCategoryFor } from "../lib/psisStore";

const router: IRouter = Router();

router.get("/entries", async (req, res): Promise<void> => {
  const entries = await listEntries();
  req.log.info({ count: entries.length }, "Listed PSIS entries");
  res.json(ListEntriesResponse.parse(entries));
});

router.post("/entries", async (req, res): Promise<void> => {
  const parsed = CreateEntryBody.safeParse(req.body);
  if (!parsed.success) {
    req.log.warn({ errors: parsed.error.message }, "Invalid entry payload");
    res.status(400).json({ message: parsed.error.message });
    return;
  }

  const input = parsed.data;
  const entry = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
    resultCategory: resultCategoryFor(input.result),
    delta: input.goodCount - input.badCount,
  };

  await appendEntry(entry);
  req.log.info({ id: entry.id }, "Created PSIS entry");
  res.status(201).json(CreateEntryResponse.parse(entry));
});

export default router;
