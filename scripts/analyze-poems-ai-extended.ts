/**
 * Batch-process poems through Claude API to generate extended AI analyses.
 * Adds `aiAnalysisExtended` key to each poem JSON with: intertextuality,
 * space, timeOfDay, motion, imageryDensity, maskSincerity.
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-ant-... npx tsx scripts/analyze-poems-ai-extended.ts
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
// System prompt (Polish literary scholar — extended analyses)
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT = `Jesteś literaturoznawcą analizującym polską poezję Rafała Wojaczka. Przeanalizuj wiersz i zwróć WYŁĄCZNIE JSON (bez markdown, bez komentarzy):

{
  "intertextuality": {
    "allusions": [{"source": string ("Biblia"|"mitologia"|"Rimbaud"|"Baudelaire"|"Leśmian"|"Tuwim"|"Różewicz"|"inne"), "reference": string, "evidence": string}],
    "selfQuotes": string[],
    "influences": {"rimbaud": 0-1, "baudelaire": 0-1, "bursa": 0-1, "stachura": 0-1, "grochowiak": 0-1, "bialoszewski": 0-1, "rozewicz": 0-1}
  },
  "space": {"type": "zamknieta"|"otwarta"|"nieokreslona", "evidence": string, "openClosedRatio": 0-1 (1=otwarta)},
  "timeOfDay": {"period": "noc"|"rano"|"dzien"|"wieczor"|"nieokreslona", "season": "wiosna"|"lato"|"jesien"|"zima"|"nieokreslona", "evidence": string},
  "motion": {"movement": number 0-10, "stillness": number 0-10, "dynamism": 0-1, "evidence": string},
  "imageryDensity": {"metaphors": number, "comparisons": number, "personifications": number, "hyperboles": number, "per100words": number},
  "maskSincerity": {"confessionLevel": 0-1, "creationLevel": 0-1, "ironicDistance": 0-1, "autobiographicSignals": string[]}
}`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/** Strip optional markdown code-fence wrapper from Claude's response. */
function stripCodeFence(text: string): string {
  const trimmed = text.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}

/** Extract poem body from the .txt file (skip title, blank, author, blank). */
function extractPoemBody(raw: string): string {
  const lines = raw.split("\n");
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

interface AiAnalysisExtended {
  intertextuality: {
    allusions: { source: string; reference: string; evidence: string }[];
    selfQuotes: string[];
    influences: {
      rimbaud: number;
      baudelaire: number;
      bursa: number;
      stachura: number;
      grochowiak: number;
      bialoszewski: number;
      rozewicz: number;
    };
  };
  space: {
    type: string;
    evidence: string;
    openClosedRatio: number;
  };
  timeOfDay: {
    period: string;
    season: string;
    evidence: string;
  };
  motion: {
    movement: number;
    stillness: number;
    dynamism: number;
    evidence: string;
  };
  imageryDensity: {
    metaphors: number;
    comparisons: number;
    personifications: number;
    hyperboles: number;
    per100words: number;
  };
  maskSincerity: {
    confessionLevel: number;
    creationLevel: number;
    ironicDistance: number;
    autobiographicSignals: string[];
  };
}

async function analyzePoem(poemText: string): Promise<AiAnalysisExtended> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 2048,
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
  return JSON.parse(cleaned) as AiAnalysisExtended;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
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

      // 2. Skip if already has extended analysis
      if (analysis.aiAnalysisExtended) {
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
      analysis.aiAnalysisExtended = aiResult;

      // 6. Write back
      await writeFile(analysisPath, JSON.stringify(analysis, null, 2) + "\n", "utf-8");

      processed++;
      console.log(`  OK ${id}`);

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
