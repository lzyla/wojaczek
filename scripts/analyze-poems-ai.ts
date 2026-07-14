/**
 * Batch-process poems through Claude API to generate 7 AI analyses per poem.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/analyze-poems-ai.ts
 */

import { readdir, readFile, writeFile } from "node:fs/promises";
import { join, basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  throw new Error("ANTHROPIC_API_KEY is required to run this script.");
}

const MODEL = "claude-sonnet-4-20250514";
const DELAY_MS = 1000; // 1 s between API calls

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const POEMS_DIR = join(ROOT, "public", "wiersze");
const ANALYSES_DIR = join(ROOT, "public", "analyses", "poems");

// ---------------------------------------------------------------------------
// System prompt (Polish literary scholar)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Jeste\u015b literaturoznawc\u0105 analizuj\u0105cym polsk\u0105 poezj\u0119. Przeanalizuj poni\u017cszy wiersz Rafa\u0142a Wojaczka i zwr\u00f3\u0107 WY\u0141\u0104CZNIE obiekt JSON (bez markdown, bez komentarzy) z nast\u0119puj\u0105c\u0105 struktur\u0105:

{
  "emotion": { "primary": string, "secondary": string, "intensity": number 0-1 },
  "subjectPresence": { "type": "jawne"|"ukryte"|"bezosobowe", "evidence": string },
  "addressee": { "type": "ty"|"b\u00f3g"|"siebie"|"nikt"|"czytelnik", "evidence": string },
  "metaphors": [{ "source": string, "target": string, "example": string }],
  "temperature": { "value": number 0-1 (0=zimne/rezygnacja, 1=gor\u0105ce/gniew/po\u017c\u0105danie), "label": string },
  "senses": { "wzrok": number, "sluch": number, "dotyk": number, "smak": number, "zapach": number },
  "autodestruction": { "level": number 0-1, "signals": string[] }
}

Emocje do wyboru: gniew, rezygnacja, ironia, czu\u0142o\u015b\u0107, obrzydzenie, t\u0119sknota, rozpacz, euforia, melancholia, bunt.
Intensywno\u015b\u0107 zmys\u0142\u00f3w: 0=brak, 1-2=minimalny, 3-4=umiarkowany, 5+=dominuj\u0105cy.`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Strip optional markdown code-fence wrapper from Claude's response. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  // Match ```json ... ``` or ``` ... ```
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}

/** Extract poem body from the .txt file (skip title, blank, author, blank). */
function extractPoemBody(raw: string): string {
  const lines = raw.split("\n");
  // Find the second blank line — poem body starts after it
  let blankCount = 0;
  let bodyStart = 0;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim() === "") {
      blankCount++;
      if (blankCount === 2) {
        bodyStart = i + 1;
        break;
      }
    }
  }
  return lines.slice(bodyStart).join("\n").trim();
}

// ---------------------------------------------------------------------------
// Claude API call
// ---------------------------------------------------------------------------

interface AiAnalysis {
  emotion: { primary: string; secondary: string; intensity: number };
  subjectPresence: { type: string; evidence: string };
  addressee: { type: string; evidence: string };
  metaphors: { source: string; target: string; example: string }[];
  temperature: { value: number; label: string };
  senses: { wzrok: number; sluch: number; dotyk: number; smak: number; zapach: number };
  autodestruction: { level: number; signals: string[] };
}

async function analyzePoem(poemText: string): Promise<AiAnalysis> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: poemText,
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  const data = (await response.json()) as {
    content: { type: string; text: string }[];
  };

  const rawText = data.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const cleaned = stripCodeFence(rawText);
  return JSON.parse(cleaned) as AiAnalysis;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  // Gather all analysis JSON files (these define the poem IDs we process)
  const analysisFiles = (await readdir(ANALYSES_DIR)).filter((f) =>
    f.endsWith(".json")
  );

  console.log(`Found ${analysisFiles.length} analysis files to process.`);
  console.log(`Poems dir: ${POEMS_DIR}`);
  console.log(`Analyses dir: ${ANALYSES_DIR}`);
  console.log("---");

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (let i = 0; i < analysisFiles.length; i++) {
    const filename = analysisFiles[i];
    const id = basename(filename, ".json");
    const poemPath = join(POEMS_DIR, `${id}.txt`);
    const analysisPath = join(ANALYSES_DIR, filename);

    // Progress log every 10 poems
    if (i > 0 && i % 10 === 0) {
      console.log(
        `[${i}/${analysisFiles.length}] processed=${processed} skipped=${skipped} errors=${errors}`
      );
    }

    try {
      // 1. Read existing analysis
      const analysisRaw = await readFile(analysisPath, "utf-8");
      const analysis = JSON.parse(analysisRaw);

      // 2. Skip if already processed
      if (analysis.aiAnalysis) {
        skipped++;
        continue;
      }

      // 3. Read poem text
      let poemRaw: string;
      try {
        poemRaw = await readFile(poemPath, "utf-8");
      } catch {
        console.warn(`  SKIP ${id}: poem file not found`);
        errors++;
        continue;
      }

      const poemBody = extractPoemBody(poemRaw);
      if (!poemBody) {
        console.warn(`  SKIP ${id}: empty poem body`);
        errors++;
        continue;
      }

      // 4. Call Claude API
      const aiResult = await analyzePoem(poemBody);

      // 5. Merge into existing analysis
      analysis.aiAnalysis = aiResult;

      // 6. Write back
      await writeFile(analysisPath, JSON.stringify(analysis, null, 2) + "\n", "utf-8");

      processed++;

      // Rate-limit delay
      await sleep(DELAY_MS);
    } catch (err: any) {
      console.error(`  ERROR ${id}: ${err.message}`);
      errors++;
      // Continue with next poem
      await sleep(DELAY_MS);
    }
  }

  console.log("---");
  console.log(
    `Done. processed=${processed} skipped=${skipped} errors=${errors} total=${analysisFiles.length}`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
