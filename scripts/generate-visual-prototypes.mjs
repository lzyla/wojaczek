import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = '/Users/lukaszzyla/wojaczek';
const POEMS_DIR = path.join(ROOT, 'public/wiersze');
const ANALYSES_DIR = path.join(ROOT, 'public/analyses/poems');
const CORPUS_PATH = path.join(ROOT, 'public/analyses/corpus.json');
const OUTPUT_DIR = path.join(ROOT, 'output/visualizations');

const COLORS = {
  paper: '#f6f2ed',
  paperDark: '#ece5dc',
  ink: '#151515',
  mist: '#8a8680',
  mistLight: '#c9c1b7',
  accent: '#c23030',
  accentSoft: '#d98a8a',
  line: '#2b2b2b',
};

const STOPWORDS = new Set([
  'a', 'aby', 'albo', 'ale', 'ani', 'aż', 'bardziej', 'bardzo', 'bez', 'bo', 'by', 'być',
  'była', 'było', 'byli', 'były', 'bym', 'byś', 'był', 'byłaś', 'byłem', 'byłoś', 'byśmy',
  'ci', 'cię', 'co', 'czy', 'czym', 'czymś', 'daleko', 'dla', 'do', 'dokąd', 'dużo', 'dwa',
  'dwie', 'gdy', 'gdzie', 'go', 'ich', 'im', 'inne', 'i', 'ja', 'jak', 'jaka', 'jakby',
  'jaki', 'je', 'jego', 'jej', 'jemu', 'jest', 'jestem', 'jeszcze', 'już', 'ją', 'kiedy',
  'kto', 'która', 'które', 'którego', 'której', 'który', 'którzy', 'ku', 'lecz', 'lub', 'ma',
  'mają', 'mam', 'mamy', 'mi', 'mną', 'mnie', 'moich', 'moja', 'moje', 'mojej', 'mojemu',
  'może', 'mu', 'my', 'na', 'nad', 'nam', 'nami', 'nas', 'nasz', 'nasza', 'nasze', 'nawet',
  'nie', 'niech', 'niej', 'niemu', 'nim', 'nimi', 'niż', 'o', 'od', 'on', 'ona', 'one', 'oni',
  'ono', 'oraz', 'po', 'pod', 'ponad', 'potem', 'przed', 'przez', 'przy', 'sam', 'sama', 'się',
  'są', 'ta', 'tak', 'taka', 'taki', 'tam', 'te', 'tego', 'tej', 'temu', 'ten', 'to', 'tobie',
  'tobą', 'toteż', 'tu', 'twój', 'twoja', 'twoje', 'twojej', 'twych', 'ty', 'u', 'we', 'więc',
  'w', 'za', 'ze', 'z', 'że',
]);

const MONTH_WORDS = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];

const FIELD_LABELS = {
  cialo: 'ciało',
  smierc: 'śmierć',
  erotyka: 'erotyka',
  alkohol: 'alkohol',
  samotnosc: 'samotność',
  sacrum: 'sacrum',
  noc: 'noc',
  bol: 'ból',
};

function normalizeText(input) {
  return input.toLowerCase().normalize('NFC');
}

function normalizeSlugish(input) {
  return normalizeText(input)
    .replace(/[„"”'`]/g, '')
    .replace(/[^a-ząćęłńóśźż0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function stripAccents(input) {
  return input.normalize('NFD').replace(/\p{M}/gu, '');
}

function escapeXml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function mapRange(value, inMin, inMax, outMin, outMax) {
  if (inMax === inMin) return (outMin + outMax) / 2;
  const t = (value - inMin) / (inMax - inMin);
  return lerp(outMin, outMax, t);
}

function mean(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function variance(values, avg = mean(values)) {
  if (!values.length) return 0;
  return mean(values.map((value) => (value - avg) ** 2));
}

function distance2D(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function tokenize(text) {
  return normalizeText(text).match(/[\p{L}\p{M}]+/gu) ?? [];
}

function isLikelyDateLine(line) {
  const compact = normalizeText(line).trim();
  if (!compact) return false;
  if (/^\d{4}$/.test(compact)) return true;
  if (/^\d{1,2}\s+[a-ząćęłńóśźż]+\s+\d{4}$/.test(compact)) return true;
  return MONTH_WORDS.some((month) => compact.includes(month));
}

function createRng(seed = 1) {
  let state = seed >>> 0;
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };
}

function smoothPath(points) {
  if (points.length < 2) return '';
  const first = points[0];
  let d = `M ${first.x.toFixed(2)} ${first.y.toFixed(2)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }
  return d;
}

function norm(vec) {
  return Math.sqrt(vec.reduce((sum, value) => sum + value * value, 0));
}

function dot(a, b) {
  let sum = 0;
  for (let i = 0; i < a.length; i += 1) sum += a[i] * b[i];
  return sum;
}

function multiplyMatrixVector(matrix, vector) {
  return matrix.map((row) => dot(row, vector));
}

function powerIteration(matrix, iterations = 120) {
  const size = matrix.length;
  let vector = Array.from({ length: size }, (_, i) => (i % 2 === 0 ? 1 : -1));
  let vectorNorm = norm(vector);
  vector = vector.map((value) => value / (vectorNorm || 1));

  for (let iter = 0; iter < iterations; iter += 1) {
    const next = multiplyMatrixVector(matrix, vector);
    vectorNorm = norm(next);
    if (!vectorNorm) break;
    vector = next.map((value) => value / vectorNorm);
  }

  const mv = multiplyMatrixVector(matrix, vector);
  const eigenvalue = dot(vector, mv);
  return { value: eigenvalue, vector };
}

function deflateMatrix(matrix, eigenvalue, eigenvector) {
  return matrix.map((row, i) =>
    row.map((value, j) => value - eigenvalue * eigenvector[i] * eigenvector[j]));
}

function pca2D(rows) {
  const dims = rows[0]?.length ?? 0;
  const means = Array.from({ length: dims }, (_, dim) => mean(rows.map((row) => row[dim])));
  const centered = rows.map((row) => row.map((value, dim) => value - means[dim]));
  const covariance = Array.from({ length: dims }, () => Array(dims).fill(0));

  for (let i = 0; i < dims; i += 1) {
    for (let j = 0; j < dims; j += 1) {
      let sum = 0;
      for (const row of centered) sum += row[i] * row[j];
      covariance[i][j] = sum / Math.max(1, centered.length - 1);
    }
  }

  const first = powerIteration(covariance);
  const second = powerIteration(deflateMatrix(covariance, first.value, first.vector));

  return centered.map((row) => ({
    x: dot(row, first.vector),
    y: dot(row, second.vector),
  }));
}

function kMeans(points, k = 5, iterations = 24) {
  const centroids = [];
  const seedPoints = [
    points[0],
    points[Math.floor(points.length * 0.2)],
    points[Math.floor(points.length * 0.4)],
    points[Math.floor(points.length * 0.6)],
    points[Math.floor(points.length * 0.8)],
  ].filter(Boolean);

  for (let i = 0; i < k; i += 1) {
    const seed = seedPoints[i] ?? points[i % points.length];
    centroids.push({ x: seed.x, y: seed.y });
  }

  let assignments = new Array(points.length).fill(0);

  for (let iter = 0; iter < iterations; iter += 1) {
    assignments = points.map((point) => {
      let bestIndex = 0;
      let bestDistance = Infinity;
      centroids.forEach((centroid, index) => {
        const distance = distance2D(point, centroid);
        if (distance < bestDistance) {
          bestDistance = distance;
          bestIndex = index;
        }
      });
      return bestIndex;
    });

    for (let index = 0; index < centroids.length; index += 1) {
      const cluster = points.filter((_, pointIndex) => assignments[pointIndex] === index);
      if (!cluster.length) continue;
      centroids[index] = {
        x: mean(cluster.map((point) => point.x)),
        y: mean(cluster.map((point) => point.y)),
      };
    }
  }

  return assignments;
}

function ellipseFromPoints(points) {
  const centerX = mean(points.map((point) => point.x));
  const centerY = mean(points.map((point) => point.y));
  const offsets = points.map((point) => ({ x: point.x - centerX, y: point.y - centerY }));
  const xs = offsets.map((point) => point.x);
  const ys = offsets.map((point) => point.y);
  const covXX = variance(xs);
  const covYY = variance(ys);
  const covXY = mean(offsets.map((point) => point.x * point.y));
  const trace = covXX + covYY;
  const det = covXX * covYY - covXY * covXY;
  const inner = Math.sqrt(Math.max(0, trace * trace / 4 - det));
  const lambda1 = trace / 2 + inner;
  const lambda2 = trace / 2 - inner;
  const angle = Math.atan2(lambda1 - covXX, covXY || 0.0001) * (180 / Math.PI);
  return {
    cx: centerX,
    cy: centerY,
    rx: Math.sqrt(Math.max(10, lambda1)) * 2.8,
    ry: Math.sqrt(Math.max(10, lambda2)) * 2.4,
    angle,
  };
}

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function cleanPoemLines(raw, expectedTitle) {
  const originalLines = raw.replace(/\r/g, '').split('\n');
  let start = 0;
  let end = originalLines.length;

  while (start < end && !originalLines[start].trim()) start += 1;
  while (end > start && !originalLines[end - 1].trim()) end -= 1;

  const titleCandidate = originalLines[start]?.trim() ?? '';
  if (titleCandidate) start += 1;

  while (start < end && !originalLines[start].trim()) start += 1;
  if ((originalLines[start] ?? '').includes('Rafał Wojaczek')) start += 1;

  while (start < end && !originalLines[start].trim()) start += 1;
  const repeatedTitle = originalLines[start]?.trim() ?? '';
  if (repeatedTitle) {
    const normalizedRepeated = normalizeSlugish(repeatedTitle);
    const normalizedExpected = normalizeSlugish(expectedTitle);
    if (normalizedRepeated === normalizedExpected || stripAccents(repeatedTitle).toUpperCase() === stripAccents(expectedTitle).toUpperCase()) {
      start += 1;
    }
  }

  while (start < end && !originalLines[start].trim()) start += 1;
  while (end > start && !originalLines[end - 1].trim()) end -= 1;
  if (end > start && isLikelyDateLine(originalLines[end - 1])) end -= 1;

  while (end > start && !originalLines[end - 1].trim()) end -= 1;

  return originalLines.slice(start, end);
}

async function loadCorpus() {
  const corpus = await readJson(CORPUS_PATH);
  const analyses = [];

  for (const poemMeta of corpus.poemIndex) {
    const analysisPath = path.join(ANALYSES_DIR, `${poemMeta.id}.json`);
    const poemPath = path.join(POEMS_DIR, `${poemMeta.id}.txt`);
    const [analysis, rawText] = await Promise.all([
      readJson(analysisPath),
      fs.readFile(poemPath, 'utf8'),
    ]);

    const lines = cleanPoemLines(rawText, analysis.title);
    const bodyText = lines.join('\n');
    const tokens = tokenize(bodyText);

    analyses.push({
      id: poemMeta.id,
      title: analysis.title,
      analysis,
      lines,
      bodyText,
      tokens,
    });
  }

  return analyses;
}

function writeSvg(fileName, svg) {
  return fs.writeFile(path.join(OUTPUT_DIR, fileName), svg, 'utf8');
}

function buildFrame({ width, height, title, subtitle, body, footer }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none">
  <rect width="${width}" height="${height}" fill="${COLORS.paper}" />
  <rect x="28" y="28" width="${width - 56}" height="${height - 56}" rx="24" fill="none" stroke="${COLORS.mistLight}" stroke-width="1" />
  <text x="72" y="90" font-size="16" font-family="Inter, Arial, sans-serif" letter-spacing="4" fill="${COLORS.accent}">${escapeXml(title.toUpperCase())}</text>
  <text x="72" y="132" font-size="48" font-family="Playfair Display, Georgia, serif" font-weight="700" fill="${COLORS.ink}">${escapeXml(subtitle)}</text>
  ${body}
  <text x="72" y="${height - 72}" font-size="15" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">${escapeXml(footer)}</text>
</svg>`;
}

function extractLineSegments(line) {
  const segments = [];
  const regex = /([\p{L}\p{M}]+)([,:;.!?…-]*)/gu;
  let match;
  while ((match = regex.exec(line)) !== null) {
    segments.push({ word: match[1], punctuation: match[2] ?? '' });
  }
  return segments;
}

function generatePartytura(poem) {
  const width = 1500;
  const height = 1080;
  const top = 220;
  const left = 90;
  const right = 1450;
  const lineGap = 54;
  const bodyHeight = poem.lines.length * lineGap;
  const maxChars = Math.max(...poem.lines.map((line) => line.length), 1);
  const avgLineLength = mean(poem.lines.map((line) => line.length));
  const rhythm = poem.analysis.syntax?.lineLength?.meanSyllables ?? poem.analysis.wordsPerLineDistribution?.reduce((sum, value) => sum + value, 0) / Math.max(1, poem.analysis.lineCount);
  const bars = [];

  poem.lines.forEach((line, lineIndex) => {
    const y = top + lineIndex * lineGap;
    const segments = extractLineSegments(line);
    const targetWidth = mapRange(line.length, 0, maxChars, 220, right - left - 100);
    const totalLetters = segments.reduce((sum, segment) => sum + segment.word.length, 0) || 1;
    let cursor = left + 90;

    bars.push(`<text x="${left}" y="${y + 7}" font-size="12" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" letter-spacing="2">${String(lineIndex + 1).padStart(2, '0')}</text>`);
    bars.push(`<line x1="${left + 62}" y1="${y}" x2="${right}" y2="${y}" stroke="${COLORS.paperDark}" stroke-width="1" />`);

    segments.forEach((segment, segmentIndex) => {
      const widthFactor = targetWidth * (segment.word.length / totalLetters);
      const rectWidth = Math.max(16, widthFactor - 8);
      const rectHeight = 12 + (segment.word.match(/[ąęioóuyae]/gi)?.length ?? 0);
      const fillOpacity = 0.08 + Math.min(0.18, segment.word.length / 40);
      bars.push(
        `<rect x="${cursor.toFixed(2)}" y="${(y - rectHeight / 2).toFixed(2)}" width="${rectWidth.toFixed(2)}" height="${rectHeight.toFixed(2)}" rx="3" fill="${COLORS.ink}" fill-opacity="${fillOpacity.toFixed(3)}" stroke="${COLORS.line}" stroke-width="0.85" />`,
      );
      if (segment.punctuation) {
        bars.push(`<line x1="${(cursor + rectWidth + 4).toFixed(2)}" y1="${(y - 10).toFixed(2)}" x2="${(cursor + rectWidth + 4).toFixed(2)}" y2="${(y + 10).toFixed(2)}" stroke="${COLORS.accent}" stroke-width="1.5" />`);
      }
      if (segmentIndex === segments.length - 1) {
        bars.push(`<text x="${(cursor + rectWidth + 16).toFixed(2)}" y="${y + 5}" font-size="11" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">${escapeXml(segment.word.slice(0, 12))}</text>`);
      }
      cursor += rectWidth + 10;
    });
  });

  const body = `
  <text x="72" y="178" font-size="16" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">wers jako takt, słowo jako nuta, interpunkcja jako pauza</text>
  <line x1="72" y1="196" x2="${width - 72}" y2="196" stroke="${COLORS.mistLight}" stroke-width="1" />
  <text x="${width - 350}" y="90" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="end">średnia długość wersu ${avgLineLength.toFixed(1)} znaku</text>
  <text x="${width - 350}" y="112" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="end">oddech ${Number(rhythm).toFixed(1)} syl./wers</text>
  <rect x="72" y="${top - 34}" width="${width - 144}" height="${bodyHeight + 68}" rx="18" fill="rgba(255,255,255,0.45)" stroke="${COLORS.mistLight}" stroke-width="1" />
  ${bars.join('\n  ')}
  <path d="M 90 ${top + bodyHeight + 40} C 380 ${top + bodyHeight - 10}, 700 ${top + bodyHeight + 70}, 1080 ${top + bodyHeight + 18} S 1380 ${top + bodyHeight + 42}, 1410 ${top + bodyHeight + 24}" stroke="${COLORS.accentSoft}" stroke-width="2.2" fill="none" opacity="0.6" />
  `;

  return buildFrame({
    width,
    height,
    title: 'Prototyp 01',
    subtitle: `Partytura wiersza / ${poem.title}`,
    body,
    footer: 'Prototyp poza aplikacją. Dane: długość wyrazów, liczba wersów, interpunkcja i rytm wersowy.',
  });
}

function createWordMatcher(root) {
  const asciiRoot = stripAccents(root.toLowerCase());
  return (token) => {
    const asciiToken = stripAccents(token.toLowerCase());
    return asciiToken === asciiRoot || asciiToken.startsWith(asciiRoot);
  };
}

function topContextWords(matches) {
  return Array.from(matches.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .slice(0, 14);
}

function selectSpacedPoints(points, limit = 8, minGap = 78) {
  const selected = [];
  for (const point of points) {
    if (selected.every((other) => Math.abs(other.x - point.x) >= minGap)) {
      selected.push(point);
    }
    if (selected.length >= limit) break;
  }
  return selected;
}

function generateMotifTrace(corpus, motif = 'krw') {
  const width = 1600;
  const height = 1040;
  const matcher = createWordMatcher(motif);
  const context = new Map();

  const poems = corpus.map((poem) => {
    const hits = [];
    poem.tokens.forEach((token, index) => {
      if (!matcher(token)) return;
      hits.push(index);
      for (let offset = -3; offset <= 3; offset += 1) {
        if (offset === 0) continue;
        const neighbor = poem.tokens[index + offset];
        if (!neighbor || matcher(neighbor) || STOPWORDS.has(neighbor)) continue;
        context.set(neighbor, (context.get(neighbor) ?? 0) + 1);
      }
    });
    return {
      ...poem,
      hits: hits.length,
      density: hits.length / Math.max(1, poem.tokens.length),
    };
  })
    .filter((poem) => poem.hits > 0)
    .sort((a, b) => b.density - a.density || b.hits - a.hits || a.title.localeCompare(b.title, 'pl'));

  const maxHits = Math.max(...poems.map((poem) => poem.hits), 1);
  const points = poems.map((poem, index) => ({
    x: mapRange(index, 0, Math.max(1, poems.length - 1), 110, width - 110),
    y: mapRange(poem.density, 0, poems[0]?.density ?? 1, 820, 300),
    hits: poem.hits,
    density: poem.density,
    poem,
  }));

  const path = smoothPath(points);
  const labels = selectSpacedPoints(points, 8, 72).map((point, index) => {
    const labelY = point.y - 54 - (index % 3) * 16;
    return `
      <line x1="${point.x}" y1="${point.y - 10}" x2="${point.x}" y2="${labelY + 10}" stroke="${COLORS.mistLight}" stroke-width="1" />
      <text x="${point.x}" y="${labelY}" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.ink}" text-anchor="middle">${escapeXml(point.poem.title)}</text>
      <text x="${point.x}" y="${labelY + 16}" font-size="11" font-family="Inter, Arial, sans-serif" fill="${COLORS.accent}" text-anchor="middle">${point.hits} wyst.</text>
    `;
  }).join('\n');

  const contextWords = topContextWords(context);
  const body = `
  <text x="72" y="178" font-size="16" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">motyw “krew / krwi / krw…” uporządkowany od największego zagęszczenia do najsłabszych śladów</text>
  <line x1="72" y1="196" x2="${width - 72}" y2="196" stroke="${COLORS.mistLight}" stroke-width="1" />
  <text x="${width - 72}" y="92" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="end">${poems.length} wierszy zawiera ślad motywu</text>
  <rect x="72" y="242" width="${width - 144}" height="620" rx="18" fill="rgba(255,255,255,0.4)" stroke="${COLORS.mistLight}" stroke-width="1" />
  <path d="${path}" fill="none" stroke="${COLORS.ink}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="${path}" fill="none" stroke="${COLORS.accent}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round" opacity="0.08" />
  ${points.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="${mapRange(point.hits, 1, maxHits, 4, 14)}" fill="${COLORS.accent}" fill-opacity="${mapRange(point.density, 0, points[0]?.density ?? 1, 0.18, 0.78).toFixed(3)}" stroke="${COLORS.paper}" stroke-width="1.5" />`).join('\n  ')}
  ${labels}
  <text x="72" y="886" font-size="14" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">najczęstsze sąsiedztwa motywu</text>
  ${contextWords.map(([word, count], index) => {
    const x = 72 + (index % 7) * 208;
    const y = 922 + Math.floor(index / 7) * 34;
    const fontSize = 16 + count * 2;
    return `<text x="${x}" y="${y}" font-size="${fontSize}" font-family="Playfair Display, Georgia, serif" fill="${index < 4 ? COLORS.accent : COLORS.ink}" opacity="${index < 4 ? 0.95 : 0.74}">${escapeXml(word)}</text>`;
  }).join('\n  ')}
  `;

  return buildFrame({
    width,
    height,
    title: 'Prototyp 02',
    subtitle: 'Ślad słowa / krew',
    body,
    footer: 'Nowy moduł text mining: motyw w korpusie z sąsiedztwami kontekstowymi, zamiast zwykłego liczenia frekwencji.',
  });
}

function normalizeFeatureBlock(values) {
  const total = values.reduce((sum, value) => sum + value, 0);
  return total ? values.map((value) => value / total) : values;
}

function dominantClusterLabel(clusterPoems) {
  const totals = { cialo: 0, smierc: 0, erotyka: 0, alkohol: 0, samotnosc: 0, sacrum: 0, noc: 0, bol: 0 };
  if (!clusterPoems.length) return 'rozproszenie';
  for (const point of clusterPoems) {
    const poem = point.poem;
    for (const key of Object.keys(totals)) {
      totals[key] += poem.analysis.semanticFields?.[key] ?? 0;
    }
  }
  const topFields = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([key]) => FIELD_LABELS[key]);
  return topFields.join(' / ');
}

function generateTopography(corpus) {
  const features = corpus.map((poem) => {
    const semantic = normalizeFeatureBlock([
      poem.analysis.semanticFields?.cialo ?? 0,
      poem.analysis.semanticFields?.smierc ?? 0,
      poem.analysis.semanticFields?.erotyka ?? 0,
      poem.analysis.semanticFields?.alkohol ?? 0,
      poem.analysis.semanticFields?.samotnosc ?? 0,
      poem.analysis.semanticFields?.sacrum ?? 0,
      poem.analysis.semanticFields?.noc ?? 0,
      poem.analysis.semanticFields?.bol ?? 0,
    ]);
    const pronouns = normalizeFeatureBlock([
      poem.analysis.pronounDistribution?.ja ?? 0,
      poem.analysis.pronounDistribution?.ty ?? 0,
      poem.analysis.pronounDistribution?.on_ona ?? 0,
      poem.analysis.pronounDistribution?.my ?? 0,
      poem.analysis.pronounDistribution?.oni ?? 0,
    ]);
    const ext = poem.analysis.aiAnalysisExtended ?? {};
    return [
      ...semantic,
      ...pronouns,
      poem.analysis.negationCount / Math.max(1, poem.analysis.wordCount),
      poem.analysis.avgWordsPerLine / 10,
      (ext.motion?.dynamism ?? 0) / 10,
      (ext.imageryDensity?.per100words ?? 0) / 100,
      (poem.analysis.aiAnalysis?.emotion?.intensity ?? 0) / 10,
    ];
  });

  const dims = features[0].length;
  const means = Array.from({ length: dims }, (_, dim) => mean(features.map((row) => row[dim])));
  const stdDevs = Array.from({ length: dims }, (_, dim) => {
    const v = variance(features.map((row) => row[dim]), means[dim]);
    return Math.sqrt(v) || 1;
  });
  const standardized = features.map((row) => row.map((value, dim) => (value - means[dim]) / stdDevs[dim]));
  const projected = pca2D(standardized);
  const minX = Math.min(...projected.map((point) => point.x));
  const maxX = Math.max(...projected.map((point) => point.x));
  const minY = Math.min(...projected.map((point) => point.y));
  const maxY = Math.max(...projected.map((point) => point.y));

  const mapped = projected.map((point, index) => ({
    x: mapRange(point.x, minX, maxX, 170, 1430),
    y: mapRange(point.y, minY, maxY, 770, 260),
    poem: corpus[index],
    source: point,
  }));

  const assignments = kMeans(mapped, 5);
  const clusters = Array.from({ length: 5 }, (_, clusterIndex) => {
    const poems = mapped.filter((_, pointIndex) => assignments[pointIndex] === clusterIndex);
    return {
      poems,
      ellipse: ellipseFromPoints(poems),
      label: dominantClusterLabel(poems),
    };
  }).sort((a, b) => b.poems.length - a.poems.length);

  const width = 1600;
  const height = 1040;
  const topTitles = [...mapped]
    .sort((a, b) => (b.poem.analysis.semanticFields?.smierc ?? 0) + (b.poem.analysis.semanticFields?.cialo ?? 0) - ((a.poem.analysis.semanticFields?.smierc ?? 0) + (a.poem.analysis.semanticFields?.cialo ?? 0)))
    .slice(0, 9);

  const clusterShapes = clusters.map((cluster, index) => {
    const color = index === 0 ? COLORS.accent : COLORS.mist;
    const opacity = index === 0 ? 0.09 : 0.06;
    return `
      <ellipse cx="${cluster.ellipse.cx}" cy="${cluster.ellipse.cy}" rx="${cluster.ellipse.rx}" ry="${cluster.ellipse.ry}" fill="${color}" fill-opacity="${opacity}" transform="rotate(${cluster.ellipse.angle.toFixed(2)} ${cluster.ellipse.cx.toFixed(2)} ${cluster.ellipse.cy.toFixed(2)})" />
      <text x="${cluster.ellipse.cx.toFixed(2)}" y="${(cluster.ellipse.cy - cluster.ellipse.ry - 18).toFixed(2)}" font-size="14" font-family="Inter, Arial, sans-serif" fill="${index === 0 ? COLORS.accent : COLORS.mist}" text-anchor="middle">${escapeXml(cluster.label)}</text>
    `;
  }).join('\n');

  const labels = topTitles.map((point, index) => {
    const dx = (index % 3 - 1) * 60;
    const dy = -18 - Math.floor(index / 3) * 14;
    return `
      <line x1="${point.x}" y1="${point.y}" x2="${point.x + dx}" y2="${point.y + dy}" stroke="${COLORS.mistLight}" stroke-width="1" />
      <text x="${point.x + dx}" y="${point.y + dy - 4}" font-size="12" font-family="Inter, Arial, sans-serif" fill="${COLORS.ink}" text-anchor="${dx < 0 ? 'end' : dx > 0 ? 'start' : 'middle'}">${escapeXml(point.poem.title)}</text>
    `;
  }).join('\n');

  const body = `
  <text x="72" y="178" font-size="16" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">mapa podobieństw między 310 wierszami; punkty układają się na podstawie pól semantycznych, zaimków, negacji, ruchu i gęstości obrazowania</text>
  <line x1="72" y1="196" x2="${width - 72}" y2="196" stroke="${COLORS.mistLight}" stroke-width="1" />
  <rect x="72" y="232" width="${width - 144}" height="660" rx="18" fill="rgba(255,255,255,0.4)" stroke="${COLORS.mistLight}" stroke-width="1" />
  ${clusterShapes}
  ${mapped.map((point) => `<circle cx="${point.x}" cy="${point.y}" r="${point.poem.analysis.wordCount > 150 ? 4.6 : 3.1}" fill="${COLORS.ink}" fill-opacity="0.72" />`).join('\n  ')}
  ${labels}
  <text x="90" y="868" font-size="12" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">obszary nie są gatunkami ani tomami; to miękkie skupiska językowe</text>
  `;

  return buildFrame({
    width,
    height,
    title: 'Prototyp 03',
    subtitle: 'Topografia korpusu',
    body,
    footer: 'Nowy moduł: mapa podobieństw zamiast listy lub wykresu. Dobra jako wejście do eksploracji całego zbioru.',
  });
}

function generateEdgeLexicon(corpus) {
  const openingCounts = new Map();
  const endingCounts = new Map();
  const transitions = new Map();

  const validToken = (token) => token && !/^\d+$/.test(token);

  for (const poem of corpus) {
    const first = normalizeText(poem.analysis.firstWord ?? '');
    const last = normalizeText(poem.analysis.lastWord ?? '');
    if (!validToken(first) || !validToken(last)) continue;
    openingCounts.set(first, (openingCounts.get(first) ?? 0) + 1);
    endingCounts.set(last, (endingCounts.get(last) ?? 0) + 1);
    const key = `${first}|||${last}`;
    transitions.set(key, (transitions.get(key) ?? 0) + 1);
  }

  const openings = Array.from(openingCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .slice(0, 9);
  const endings = Array.from(endingCounts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'pl'))
    .slice(0, 9);

  const openingIndex = new Map(openings.map(([word], index) => [word, index]));
  const endingIndex = new Map(endings.map(([word], index) => [word, index]));
  const selectedTransitions = Array.from(transitions.entries())
    .map(([key, count]) => {
      const [from, to] = key.split('|||');
      return { from, to, count };
    })
    .filter((item) => openingIndex.has(item.from) && endingIndex.has(item.to))
    .sort((a, b) => b.count - a.count || a.from.localeCompare(b.from, 'pl'))
    .slice(0, 22);

  const width = 1600;
  const height = 1040;
  const leftX = 230;
  const rightX = 1370;
  const lineTop = 308;
  const lineGap = 64;

  const openingNodes = openings.map(([word, count], index) => ({
    word,
    count,
    x: leftX,
    y: lineTop + index * lineGap,
  }));
  const endingNodes = endings.map(([word, count], index) => ({
    word,
    count,
    x: rightX,
    y: lineTop + index * lineGap,
  }));

  const body = `
  <text x="72" y="178" font-size="16" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}">dodatkowy text mining: pierwsze i ostatnie słowo każdego wiersza, potraktowane jak dwa brzegi tej samej wypowiedzi</text>
  <line x1="72" y1="196" x2="${width - 72}" y2="196" stroke="${COLORS.mistLight}" stroke-width="1" />
  <rect x="72" y="232" width="${width - 144}" height="700" rx="18" fill="rgba(255,255,255,0.4)" stroke="${COLORS.mistLight}" stroke-width="1" />
  <text x="${leftX}" y="270" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="middle" letter-spacing="2">OTWARCIA</text>
  <text x="${rightX}" y="270" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="middle" letter-spacing="2">DOMKNIĘCIA</text>
  <circle cx="${width / 2}" cy="540" r="188" fill="${COLORS.accent}" fill-opacity="0.035" />
  ${selectedTransitions.map((item) => {
    const fromNode = openingNodes[openingIndex.get(item.from)];
    const toNode = endingNodes[endingIndex.get(item.to)];
    const controlX1 = 560;
    const controlX2 = 1040;
    const strokeWidth = mapRange(item.count, 1, Math.max(...selectedTransitions.map((t) => t.count)), 1.2, 6);
    const opacity = mapRange(item.count, 1, Math.max(...selectedTransitions.map((t) => t.count)), 0.18, 0.55);
    return `<path d="M ${fromNode.x + 92} ${fromNode.y - 6} C ${controlX1} ${fromNode.y - 12}, ${controlX2} ${toNode.y - 12}, ${toNode.x - 92} ${toNode.y - 6}" stroke="${item.count > 1 ? COLORS.accent : COLORS.mistLight}" stroke-width="${strokeWidth.toFixed(2)}" stroke-opacity="${opacity.toFixed(3)}" fill="none" />`;
  }).join('\n  ')}
  ${openingNodes.map((node) => `
    <circle cx="${node.x - 96}" cy="${node.y - 8}" r="${mapRange(node.count, openings[openings.length - 1][1], openings[0][1], 4, 10).toFixed(2)}" fill="${COLORS.accent}" fill-opacity="0.72" />
    <text x="${node.x - 78}" y="${node.y}" font-size="${(18 + node.count * 1.2).toFixed(1)}" font-family="Playfair Display, Georgia, serif" fill="${COLORS.ink}" text-anchor="start">${escapeXml(node.word)}</text>
    <text x="${node.x + 54}" y="${node.y}" font-size="11" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="start">${node.count}×</text>
  `).join('\n  ')}
  ${endingNodes.map((node) => `
    <circle cx="${node.x + 96}" cy="${node.y - 8}" r="${mapRange(node.count, endings[endings.length - 1][1], endings[0][1], 4, 10).toFixed(2)}" fill="${COLORS.ink}" fill-opacity="0.72" />
    <text x="${node.x + 78}" y="${node.y}" font-size="${(18 + node.count * 1.2).toFixed(1)}" font-family="Playfair Display, Georgia, serif" fill="${COLORS.ink}" text-anchor="end">${escapeXml(node.word)}</text>
    <text x="${node.x - 54}" y="${node.y}" font-size="11" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="end">${node.count}×</text>
  `).join('\n  ')}
  <text x="${width / 2}" y="520" font-size="28" font-family="Playfair Display, Georgia, serif" fill="${COLORS.ink}" text-anchor="middle">Brzegi wierszy</text>
  <text x="${width / 2}" y="550" font-size="13" font-family="Inter, Arial, sans-serif" fill="${COLORS.mist}" text-anchor="middle">powtarzalne wejścia i wyjścia z wiersza</text>
  `;

  return buildFrame({
    width,
    height,
    title: 'Prototyp 04',
    subtitle: 'Brzegi wierszy',
    body,
    footer: 'Dodatkowy moduł: mapa pierwszych i ostatnich słów. Bardziej literacka niż klasyczny ranking frekwencji.',
  });
}

function buildIndexHtml(files) {
  const cards = files.map(({ title, file, note }) => `
    <article class="card">
      <img src="./${file}" alt="${escapeXml(title)}" />
      <div class="meta">
        <h2>${escapeXml(title)}</h2>
        <p>${escapeXml(note)}</p>
      </div>
    </article>
  `).join('\n');

  return `<!doctype html>
<html lang="pl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Wizualizacje Wojaczek</title>
  <style>
    :root {
      --paper: ${COLORS.paper};
      --ink: ${COLORS.ink};
      --mist: ${COLORS.mist};
      --accent: ${COLORS.accent};
      --line: ${COLORS.paperDark};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: Inter, Arial, sans-serif;
      color: var(--ink);
      background:
        radial-gradient(circle at top, rgba(194,48,48,0.08), transparent 36%),
        linear-gradient(180deg, #fbf8f4 0%, var(--paper) 100%);
      padding: 48px 24px 80px;
    }
    .wrap {
      max-width: 1320px;
      margin: 0 auto;
    }
    h1 {
      font: 700 64px/0.92 "Playfair Display", Georgia, serif;
      margin: 0 0 14px;
      letter-spacing: -0.04em;
    }
    .lead {
      max-width: 820px;
      color: var(--mist);
      font-size: 18px;
      line-height: 1.65;
      margin-bottom: 32px;
    }
    .grid {
      display: grid;
      gap: 28px;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
    }
    .card {
      margin: 0;
      background: rgba(255,255,255,0.72);
      border: 1px solid var(--line);
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 24px 80px rgba(0,0,0,0.05);
    }
    img {
      display: block;
      width: 100%;
      height: auto;
    }
    .meta {
      padding: 18px 20px 22px;
    }
    h2 {
      font: 700 28px/1 "Playfair Display", Georgia, serif;
      margin: 0 0 10px;
    }
    p {
      margin: 0;
      color: var(--mist);
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <h1>Wizualizacje poza projektem</h1>
    <p class="lead">Cztery spokojne, abstrakcyjne prototypy oparte na realnym korpusie Wojaczka. Nie są jeszcze podpięte do aplikacji. To materiał do oceny kierunku: od pojedynczego wiersza, przez motyw, po mapę całego zbioru i warstwę fraz.</p>
    <section class="grid">
      ${cards}
    </section>
  </div>
</body>
</html>`;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const corpus = await loadCorpus();

  const selectedPoem = corpus.find((poem) => poem.id === 'reszta-krwi') ?? corpus[0];
  const files = [
    {
      title: 'Partytura wiersza / Reszta krwi',
      file: 'partytura-reszta-krwi.svg',
      note: 'Wersy zapisane jak takty. Długość słów i interpunkcja budują partyturę oddechu.',
      svg: generatePartytura(selectedPoem),
    },
    {
      title: 'Ślad słowa / krew',
      file: 'slad-slowa-krew.svg',
      note: 'Motyw ułożony według zagęszczenia w korpusie, z najbliższymi słowami kontekstowymi.',
      svg: generateMotifTrace(corpus, 'krw'),
    },
    {
      title: 'Topografia korpusu',
      file: 'topografia-korpusu.svg',
      note: 'Mapa podobieństw między wierszami, oparta na polach semantycznych i cechach stylistycznych.',
      svg: generateTopography(corpus),
    },
    {
      title: 'Brzegi wierszy',
      file: 'brzegi-wierszy.svg',
      note: 'Pierwsze i ostatnie słowa połączone jak dwa brzegi jednego korpusu.',
      svg: generateEdgeLexicon(corpus),
    },
  ];

  await Promise.all(files.map(({ file, svg }) => writeSvg(file, svg)));
  const indexHtml = buildIndexHtml(files.map(({ title, file, note }) => ({ title, file, note })));
  await fs.writeFile(path.join(OUTPUT_DIR, 'index.html'), indexHtml, 'utf8');

  console.log(`Generated ${files.length} visualizations in ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
