#!/usr/bin/env python3
"""
Full NLP analysis of Wojaczek poems using spaCy pl_core_news_lg.
Generates comprehensive analysis JSONs with morphology, syntax,
phonetics, metrics — 8 sub-categories total.

Writes per-poem data to public/analyses/poems/{id}.json (merged)
and corpus-level aggregation to public/analyses/corpus.json.

Usage: python3 scripts/analyze-spacy.py
"""

import json
import os
import re
import statistics
from pathlib import Path
from collections import Counter, defaultdict

import spacy

# ── Config ──────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
POEMS_DIR = ROOT / "public" / "wiersze"
OUTPUT_DIR = ROOT / "public" / "analyses" / "poems"
CORPUS_PATH = ROOT / "public" / "analyses" / "corpus.json"

# ── Polish phonetics ────────────────────────────────────────────────
VOWELS = set("aeioóuyąę")
CONSONANTS = set("bcćddfghjklłmnńpqrsśtvwxzźż")
SIBILANTS = {"sz", "ż", "rz", "cz", "dż"}          # szumiące
SIBILANTS_S = {"s", "z", "c", "dz", "ś", "ź", "ć", "dź"}  # syczące
NASALS = {"m", "n", "ń", "ą", "ę"}
LIQUIDS = {"l", "ł", "r"}

# ── Concrete vs Abstract nouns ──────────────────────────────────────
CONCRETE_NOUNS = {
    "ciało", "ręce", "oczy", "usta", "skóra", "krew", "kości", "włosy",
    "brzuch", "nogi", "głowa", "palce", "serce", "płuca", "żebra", "język",
    "zęby", "pierś", "ramiona", "kolana", "stopy", "paznokcie",
    "wódka", "wino", "piwo", "papieros", "nóż", "kamień", "chleb", "woda",
    "ziemia", "drzewo", "dom", "okno", "ściana", "pokój", "łóżko", "stół",
    "krzesło", "ulica", "mur", "schody", "drzwi", "klucz", "butelka",
    "szklanka", "talerz", "lustro", "świeca", "lampa",
    "ptak", "kot", "pies", "ryba", "robak", "mucha",
}
ABSTRACT_NOUNS = {
    "śmierć", "miłość", "cisza", "wolność", "ból", "strach", "radość",
    "smutek", "gniew", "wstyd", "nadzieja", "rozpacz", "tęsknota",
    "samotność", "pustka", "nicość", "wieczność", "prawda", "kłamstwo",
    "grzech", "wina", "zbawienie", "potępienie", "przeszłość", "przyszłość",
    "czas", "pamięć", "zapomnienie", "sen", "marzenie", "życie", "istnienie",
    "nieistnienie", "dusza", "sumienie", "żal", "los", "przeznaczenie",
}

# ── Verb semantic categories ────────────────────────────────────────
VERB_SEMANTICS = {
    "ruch": {"iść", "biec", "wracać", "uciekać", "jechać", "lecieć",
             "wchodzić", "wychodzić", "spadać", "skakać", "płynąć", "gonić",
             "podążać", "pędzić", "kroczyć", "zbliżać"},
    "percepcja": {"widzieć", "słyszeć", "czuć", "dotykać", "patrzeć",
                  "oglądać", "słuchać", "wąchać", "smakować", "dostrzegać",
                  "zauważać", "obserwować", "rozpoznawać"},
    "stan": {"być", "leżeć", "spać", "milczeć", "stać", "siedzieć",
             "czekać", "trwać", "istnieć", "żyć", "mieszkać", "zostawać",
             "pozostawać"},
    "destrukcja": {"palić", "łamać", "niszczyć", "zabijać", "ciąć", "rwać",
                   "tłuc", "gryźć", "drzeć", "rozbijać", "burzyć",
                   "mordować", "ranić", "kaleczýc", "dusić"},
    "tworzenie": {"pisać", "budować", "rodzić", "tworzyć", "malować",
                  "szyć", "lepić", "rzeźbić", "komponować"},
    "komunikacja": {"mówić", "krzyczeć", "szeptać", "milczeć", "wołać",
                    "prosić", "pytać", "odpowiadać", "śpiewać", "recytować",
                    "kłamać", "przeklinać"},
    "cialo": {"jeść", "pić", "oddychać", "krwawić", "wymiotować", "pocić",
              "ssać", "gryźć", "lizać", "połykać", "kąsać", "drapać",
              "kaszleć"},
}

# ── Adjective categories ───────────────────────────────────────────
ADJ_SENSORY = {
    "gorący", "zimny", "mokry", "suchy", "ciemny", "jasny", "głośny",
    "cichy", "gładki", "szorstki", "twardy", "miękki", "ostry", "słodki",
    "gorzki", "kwaśny", "wilgotny", "lepki", "chłodny", "ciepły",
    "lodowaty", "czerwony", "biały", "czarny", "szary", "blady", "różowy",
}
ADJ_EVALUATIVE = {
    "dobry", "zły", "piękny", "brzydki", "okropny", "wspaniały", "cudowny",
    "straszny", "wstrętny", "obrzydliwy", "nudny", "ciekawy", "smutny",
    "wesoły", "przykry",
}
ADJ_DESCRIPTIVE = {
    "duży", "mały", "stary", "nowy", "młody", "wysoki", "niski", "długi",
    "krótki", "szeroki", "wąski", "gruby", "cienki", "ciężki", "lekki",
    "pusty", "pełny", "pierwszy", "ostatni",
}

# ── Adverb categories ──────────────────────────────────────────────
ADV_TEMPORAL = {
    "jeszcze", "już", "zawsze", "nigdy", "ciągle", "wciąż", "teraz",
    "potem", "przedtem", "dawno", "niedawno", "kiedyś", "zaraz", "wkrótce",
    "dotąd", "nadal",
}
ADV_MODAL = {
    "może", "pewnie", "chyba", "zapewne", "rzeczywiście", "istotnie",
    "faktycznie", "niewątpliwie", "prawdopodobnie", "oczywiście",
    "naturalnie",
}
ADV_MANNER = {
    "cicho", "wolno", "szybko", "mocno", "lekko", "spokojnie",
    "gwałtownie", "delikatnie", "brutalnie", "łagodnie", "ostro",
    "głęboko", "płytko", "nagle", "powoli",
}

# ── Semantic field keywords (reused for reference) ─────────────────
SEMANTIC_FIELDS = {
    "ciało": {"ciało", "ręce", "ręka", "dłonie", "dłoń", "oczy", "oko",
              "usta", "skóra", "krew", "kości", "kość", "włosy", "brzuch",
              "serce", "pierś", "piersi", "palce", "palec", "nogi", "noga",
              "głowa", "twarz", "żyły", "ramiona", "plecy", "biodra",
              "język", "zęby", "gardło", "żebra", "kark", "mięso", "pot",
              "łzy", "ślina", "warga", "wargi"},
    "śmierć": {"śmierć", "umrzeć", "umierać", "grób", "trup", "zabić",
               "zabijać", "pogrzeb", "koniec", "konać", "martwy", "umarł",
               "zgon", "krew", "rana", "rany", "samobójstwo", "nóż",
               "brzytwa", "krwawić", "cmentarz", "trumna", "mogiła"},
    "erotyka": {"kochać", "kochanie", "miłość", "pożądanie", "pragnienie",
                "całować", "pocałunek", "łóżko", "nagi", "naga", "nagie",
                "srom", "łono", "rozkosz", "orgazm", "dotyk", "dotykać",
                "pieścić", "gorący", "mokra"},
    "alkohol": {"wódka", "wino", "piwo", "pić", "pijany", "butelka",
                "kieliszek", "bar", "knajpa", "kac", "rzygać",
                "wymiotować", "spirytus"},
    "samotność": {"sam", "sama", "samotny", "samotność", "pusty", "pustka",
                  "cisza", "milczenie", "milczeć", "nikt", "opuszczony",
                  "porzucony", "obcy", "brak"},
    "sacrum": {"bóg", "modlitwa", "kościół", "anioł", "grzech",
               "zbawienie", "niebo", "piekło", "diabeł", "krzyż", "dusza",
               "święty", "msza", "kapłan", "chrystus", "hostia"},
    "noc": {"noc", "nocą", "nocny", "ciemność", "ciemno", "mrok", "sen",
            "śnić", "bezsenność", "koszmar", "księżyc", "gwiazdy",
            "zmierzch", "wieczór", "cień", "cienie"},
    "ból": {"ból", "boleć", "cierpieć", "cierpienie", "męka", "krzyk",
            "krzyczeć", "płakać", "łzy", "szloch", "wrzask", "wyć",
            "drżeć", "konwulsje"},
}

# ── Binary oppositions ─────────────────────────────────────────────
OPPOSITIONS = [
    ("życie", "śmierć"), ("miłość", "nienawiść"), ("ciało", "dusza"),
    ("światło", "ciemność"), ("cisza", "krzyk"), ("dzień", "noc"),
    ("narodziny", "śmierć"), ("piękno", "brzydota"),
    ("sacrum", "profanum"),
]

# ── Negation words ─────────────────────────────────────────────────
NEGATION_WORDS = {"nie", "nic", "nikt", "nigdy", "nigdzie", "żaden"}


# ════════════════════════════════════════════════════════════════════
# Helpers
# ════════════════════════════════════════════════════════════════════

def count_syllables(word: str) -> int:
    """Approximate syllable count for Polish: count vowel groups."""
    return max(1, sum(1 for c in word.lower() if c in VOWELS))


def count_syllables_line(line: str) -> int:
    """Count syllables in a whole line."""
    return sum(count_syllables(w) for w in line.split() if w.strip())


# ════════════════════════════════════════════════════════════════════
# Poem parsing
# ════════════════════════════════════════════════════════════════════

def parse_poem(path: Path):
    """Parse poem file -> (title, body_text, body_lines, raw_lines_with_blanks)"""
    text = path.read_text(encoding="utf-8")
    lines = text.strip().split("\n")
    title = lines[0].strip() if lines else ""

    # Find body start (after "Rafał Wojaczek" line)
    body_start = 0
    for i, line in enumerate(lines):
        if "Rafał Wojaczek" in line:
            body_start = i + 1
            break

    # Skip optional duplicate title in CAPS
    if body_start < len(lines) and lines[body_start].strip().upper() == title.upper():
        body_start += 1

    raw_body_lines = lines[body_start:]

    # Remove trailing date lines
    while raw_body_lines and re.match(r"^\d+[\s/]", raw_body_lines[-1].strip()):
        raw_body_lines.pop()

    # body_lines = non-empty lines only (for analysis)
    body_lines = [l for l in raw_body_lines if l.strip()]
    body_text = "\n".join(body_lines)
    return title, body_text, body_lines, raw_body_lines


# ════════════════════════════════════════════════════════════════════
# 1. MORPHOLOGY
# ════════════════════════════════════════════════════════════════════

def analyze_morphology(doc, body_text: str):
    """
    Full morphological analysis:
    - POS counts & percents
    - Noun concrete/abstract
    - Verb tenses & semantics
    - Adjective types
    - Adverb types & top list
    - Pronoun person distribution
    - Negation analysis
    """
    pos_counts = Counter()
    verb_tenses = Counter()
    verb_sem = {k: 0 for k in VERB_SEMANTICS}
    adj_types = {"zmyslowe": 0, "oceniajace": 0, "opisowe": 0}
    adv_temporal = []
    adv_modal = []
    adv_manner = []
    all_adverbs = []
    pronouns = {"ja": 0, "ty": 0, "on_ona": 0, "my": 0, "wy": 0, "oni": 0}
    nouns_concrete = 0
    nouns_abstract = 0
    negation_counts = {"nie": 0, "nic": 0, "nikt": 0, "nigdy": 0, "nigdzie": 0, "zaden": 0}

    total_sentences = len(list(doc.sents))

    for token in doc:
        if token.is_punct or token.is_space:
            continue

        pos_counts[token.pos_] += 1
        lemma = token.lemma_.lower()
        text_lower = token.text.lower()

        # ── Verbs ──
        if token.pos_ == "VERB" or token.pos_ == "AUX":
            # Tense mapping
            vf = token.morph.get("VerbForm")
            mood = token.morph.get("Mood")
            tense = token.morph.get("Tense")

            if vf and vf[0] == "Inf":
                verb_tenses["infinitive"] += 1
            elif mood and mood[0] == "Imp":
                verb_tenses["imperative"] += 1
            elif mood and mood[0] == "Cnd":
                verb_tenses["conditional"] += 1
            elif tense:
                t = tense[0]
                if t == "Pres":
                    verb_tenses["present"] += 1
                elif t == "Past":
                    verb_tenses["past"] += 1
                elif t == "Fut":
                    verb_tenses["future"] += 1

            # Verb semantics
            for cat, verbs in VERB_SEMANTICS.items():
                if lemma in verbs:
                    verb_sem[cat] += 1
                    break

        # ── Adjectives ──
        if token.pos_ == "ADJ":
            if lemma in ADJ_SENSORY:
                adj_types["zmyslowe"] += 1
            elif lemma in ADJ_EVALUATIVE:
                adj_types["oceniajace"] += 1
            elif lemma in ADJ_DESCRIPTIVE:
                adj_types["opisowe"] += 1
            else:
                adj_types["opisowe"] += 1  # default

        # ── Nouns ──
        if token.pos_ == "NOUN":
            if lemma in CONCRETE_NOUNS:
                nouns_concrete += 1
            elif lemma in ABSTRACT_NOUNS:
                nouns_abstract += 1
            # else: uncategorized — don't count either way

        # ── Adverbs ──
        if token.pos_ == "ADV":
            all_adverbs.append(text_lower)
            if lemma in ADV_TEMPORAL or text_lower in ADV_TEMPORAL:
                adv_temporal.append(text_lower)
            elif lemma in ADV_MODAL or text_lower in ADV_MODAL:
                adv_modal.append(text_lower)
            elif lemma in ADV_MANNER or text_lower in ADV_MANNER:
                adv_manner.append(text_lower)

        # ── Pronouns ──
        if token.pos_ == "PRON":
            person = token.morph.get("Person")
            number = token.morph.get("Number")
            p = person[0] if person else None
            n = number[0] if number else None
            if p == "1" and n == "Sing":
                pronouns["ja"] += 1
            elif p == "2" and n == "Sing":
                pronouns["ty"] += 1
            elif p == "3" and n == "Sing":
                pronouns["on_ona"] += 1
            elif p == "1" and n == "Plur":
                pronouns["my"] += 1
            elif p == "2" and n == "Plur":
                pronouns["wy"] += 1
            elif p == "3" and n == "Plur":
                pronouns["oni"] += 1

        # ── Negations ──
        if text_lower == "nie":
            negation_counts["nie"] += 1
        elif lemma == "nic" or text_lower == "nic":
            negation_counts["nic"] += 1
        elif lemma == "nikt" or text_lower == "nikt":
            negation_counts["nikt"] += 1
        elif text_lower == "nigdy":
            negation_counts["nigdy"] += 1
        elif text_lower == "nigdzie":
            negation_counts["nigdzie"] += 1
        elif lemma == "żaden" or text_lower in ("żaden", "żadna", "żadne", "żadnego", "żadnej", "żadnym"):
            negation_counts["zaden"] += 1

    total_tokens = sum(pos_counts.values()) or 1
    neg_total = sum(negation_counts.values())
    neg_pct_sent = round(neg_total / max(total_sentences, 1), 2)

    # POS percent
    TARGET_POS = ["NOUN", "VERB", "ADJ", "ADV", "PRON", "ADP", "CCONJ", "SCONJ", "INTJ", "PART", "DET", "NUM"]
    pos_out = {p: pos_counts.get(p, 0) for p in TARGET_POS}
    pos_pct = {p: round(pos_counts.get(p, 0) / total_tokens, 3) for p in TARGET_POS}

    noun_total = nouns_concrete + nouns_abstract
    noun_ratio = round(nouns_concrete / noun_total, 2) if noun_total else 0.0

    # Adverb top list
    adv_counter = Counter(all_adverbs)
    adv_top = [{"word": w, "count": c} for w, c in adv_counter.most_common(10)]

    return {
        "pos": pos_out,
        "posPercent": pos_pct,
        "nounConcreteAbstract": {
            "concrete": nouns_concrete,
            "abstract": nouns_abstract,
            "ratio": noun_ratio,
        },
        "verbTenses": dict(verb_tenses),
        "verbSemantics": verb_sem,
        "adjectiveTypes": adj_types,
        "adverbs": {
            "temporalne": sorted(set(adv_temporal)),
            "modalne": sorted(set(adv_modal)),
            "sposobu": sorted(set(adv_manner)),
            "top": adv_top,
        },
        "pronouns": pronouns,
        "negations": {
            **negation_counts,
            "total": neg_total,
            "percentSentences": neg_pct_sent,
        },
    }


# ════════════════════════════════════════════════════════════════════
# 2. SYNTAX
# ════════════════════════════════════════════════════════════════════

def analyze_syntax(body_lines: list, doc):
    """
    Sentence length stats, line length stats, sentence types,
    ellipsis, enjambement, word order.
    """
    # ── Sentence lengths ──
    sentence_lengths = []
    sent_types = {"declarative": 0, "interrogative": 0, "imperative": 0, "exclamatory": 0}

    for sent in doc.sents:
        text = sent.text.strip()
        words = [t for t in sent if not t.is_punct and not t.is_space]
        wlen = len(words)
        sentence_lengths.append(wlen)

        if text.endswith("?"):
            sent_types["interrogative"] += 1
        elif text.endswith("!"):
            sent_types["exclamatory"] += 1
        else:
            has_imp = any(t.morph.get("Mood") == ["Imp"] for t in sent if t.pos_ == "VERB")
            if has_imp:
                sent_types["imperative"] += 1
            else:
                sent_types["declarative"] += 1

    if sentence_lengths:
        sl_mean = round(statistics.mean(sentence_lengths), 1)
        sl_median = round(statistics.median(sentence_lengths))
        sl_min = min(sentence_lengths)
        sl_max = max(sentence_lengths)
        # Distribution: bucket by length 0,1,2,...,max
        sl_dist = [0] * (sl_max + 1)
        for l in sentence_lengths:
            sl_dist[l] += 1
    else:
        sl_mean = sl_median = sl_min = sl_max = 0
        sl_dist = []

    # ── Line lengths ──
    line_word_counts = []
    line_syllable_counts = []
    for line in body_lines:
        words = line.split()
        line_word_counts.append(len(words))
        line_syllable_counts.append(count_syllables_line(line))

    if line_word_counts:
        lw_mean = round(statistics.mean(line_word_counts), 1)
        ls_mean = round(statistics.mean(line_syllable_counts), 1)
        max_wc = max(line_word_counts)
        lw_dist = [0] * (max_wc + 1)
        for c in line_word_counts:
            lw_dist[c] += 1
    else:
        lw_mean = ls_mean = 0
        lw_dist = []

    # ── Ellipsis detection ──
    ellipsis_incomplete = 0
    ellipsis_no_subj = 0
    ellipsis_no_pred = 0
    for sent in doc.sents:
        tokens = [t for t in sent if not t.is_punct and not t.is_space]
        if not tokens:
            continue
        has_subj = any(t.dep_ in ("nsubj", "nsubj:pass") for t in sent)
        has_pred = any(t.pos_ == "VERB" or t.pos_ == "AUX" for t in sent)
        if not has_subj and not has_pred:
            ellipsis_incomplete += 1
        elif not has_subj:
            ellipsis_no_subj += 1
        elif not has_pred:
            ellipsis_no_pred += 1

    total_sents = len(sentence_lengths) or 1
    ellipsis_total = ellipsis_incomplete + ellipsis_no_subj + ellipsis_no_pred

    # ── Enjambement ──
    enjamb_positions = []
    for i, line in enumerate(body_lines[:-1]):
        stripped = line.rstrip()
        if not stripped:
            continue
        last_char = stripped[-1]
        if last_char not in ".!?;:,—–-…\"'»":
            # Check if next line starts lowercase or with conjunction
            next_line = body_lines[i + 1].lstrip() if i + 1 < len(body_lines) else ""
            if next_line and (next_line[0].islower() or next_line.split()[0].lower() in ("i", "a", "lub", "albo", "lecz", "bo", "że", "który", "która", "które", "gdy", "kiedy")):
                enjamb_positions.append(i + 1)  # 1-indexed line number

    enjamb_count = len(enjamb_positions)
    enjamb_pct = round(enjamb_count / max(len(body_lines) - 1, 1), 2)

    # ── Word order analysis ──
    svo_count = 0
    inversion_count = 0
    other_order = 0
    for sent in doc.sents:
        tokens = [t for t in sent if not t.is_punct and not t.is_space]
        if len(tokens) < 2:
            continue
        subj_pos = None
        verb_pos = None
        for idx, t in enumerate(tokens):
            if t.dep_ in ("nsubj", "nsubj:pass") and subj_pos is None:
                subj_pos = idx
            if t.pos_ == "VERB" and verb_pos is None:
                verb_pos = idx
        if subj_pos is not None and verb_pos is not None:
            if subj_pos < verb_pos:
                svo_count += 1
            else:
                inversion_count += 1
        else:
            other_order += 1

    total_order = svo_count + inversion_count + other_order or 1

    return {
        "sentenceLength": {
            "mean": sl_mean,
            "median": sl_median,
            "min": sl_min,
            "max": sl_max,
            "distribution": sl_dist,
        },
        "lineLength": {
            "meanWords": lw_mean,
            "meanSyllables": ls_mean,
            "distribution": lw_dist,
        },
        "sentenceTypes": sent_types,
        "ellipsis": {
            "incomplete": ellipsis_incomplete,
            "noSubject": ellipsis_no_subj,
            "noPredicate": ellipsis_no_pred,
            "percent": round(ellipsis_total / total_sents, 2),
        },
        "enjambement": {
            "count": enjamb_count,
            "percent": enjamb_pct,
            "positions": enjamb_positions,
        },
        "wordOrder": {
            "svo": svo_count,
            "inversions": inversion_count,
            "other": other_order,
            "deviationPercent": round((inversion_count + other_order) / total_order, 2),
        },
    }


# ════════════════════════════════════════════════════════════════════
# 3. PHONETICS
# ════════════════════════════════════════════════════════════════════

def _find_digraphs(text_lower: str, digraph_set: set):
    """Count occurrences of digraphs (sz, cz, rz, dz, dż, dź) in text."""
    count = 0
    i = 0
    while i < len(text_lower) - 1:
        pair = text_lower[i:i+2]
        if pair in digraph_set:
            count += 1
            i += 2
        else:
            i += 1
    return count


def analyze_phonetics(text: str, body_lines: list):
    """
    Vowel/consonant ratio, consonant clusters, sound groups,
    rhyme approximation.
    """
    lower = text.lower()
    chars = [c for c in lower if c.isalpha()]
    total = len(chars) or 1

    vowel_count = sum(1 for c in chars if c in VOWELS)
    consonant_count = sum(1 for c in chars if c in CONSONANTS)

    # ── Consonant clusters (3+ consecutive consonants) ──
    cluster_pattern = re.compile(r"[bcćdfghjklłmnńprsśtwzźż]{3,}")
    clusters_found = cluster_pattern.findall(lower)
    cluster_counter = Counter(clusters_found)
    cluster_top = [{"cluster": cl, "count": c} for cl, c in cluster_counter.most_common(10)]

    # ── Sound groups ──
    # Szumiące: count digraphs sz, rz, cz, dż + standalone ż
    szum_digraphs = {"sz", "rz", "cz", "dż"}
    szum_count = _find_digraphs(lower, szum_digraphs)
    szum_count += sum(1 for c in lower if c == "ż")

    # Syczące: s, z, c, ś, ź, ć + digraphs dz, dź
    syc_singles = sum(1 for c in lower if c in {"ś", "ź", "ć"})
    # Count s, z, c that are NOT part of sz, rz, cz, dz digraphs
    for i, c in enumerate(lower):
        if c in {"s", "z", "c"}:
            # Check it's not part of a digraph
            if c == "s" and i + 1 < len(lower) and lower[i+1] == "z":
                continue  # part of sz
            if c == "z" and i > 0 and lower[i-1] in ("s", "r", "c", "d"):
                continue  # part of sz/rz/cz/dz
            if c == "c" and i + 1 < len(lower) and lower[i+1] == "z":
                continue  # part of cz
            syc_singles += 1
    syc_digraph_dz = sum(1 for i in range(len(lower)-1) if lower[i:i+2] == "dz" and (i+2 >= len(lower) or lower[i+2] not in ("ż",)))
    # Simplify: just use a rough count
    syc_count = syc_singles

    nasal_count = sum(1 for c in lower if c in NASALS)
    liquid_count = sum(1 for c in lower if c in LIQUIDS)

    # ── Rhyme detection (end-of-line analysis) ──
    def line_ending(line: str, n=3):
        """Get last n characters of last word."""
        words = line.strip().rstrip(".,;:!?—–-…\"'»").split()
        if not words:
            return ""
        return words[-1].lower()[-n:]

    exact_rhymes = 0
    approx_rhymes = 0
    internal_rhymes = 0
    assonance_count = 0
    alliteration_count = 0

    endings = [line_ending(l) for l in body_lines]
    # Check consecutive and alternating pairs for rhymes
    for i in range(len(endings)):
        for j in range(i + 1, min(i + 5, len(endings))):
            if not endings[i] or not endings[j]:
                continue
            if len(endings[i]) >= 3 and endings[i] == endings[j]:
                exact_rhymes += 1
            elif len(endings[i]) >= 2 and endings[i][-2:] == endings[j][-2:]:
                approx_rhymes += 1

    # Assonance: repeated vowel patterns within nearby lines
    for i in range(len(body_lines) - 1):
        v1 = [c for c in body_lines[i].lower() if c in VOWELS]
        v2 = [c for c in body_lines[i+1].lower() if c in VOWELS]
        if len(v1) >= 3 and len(v2) >= 3:
            # Check if last 3 vowels match
            if v1[-3:] == v2[-3:]:
                assonance_count += 1

    # Alliteration: consecutive lines starting with same consonant
    for i in range(len(body_lines) - 1):
        w1 = body_lines[i].strip().split()
        w2 = body_lines[i+1].strip().split()
        if w1 and w2:
            c1 = w1[0][0].lower() if w1[0] else ""
            c2 = w2[0][0].lower() if w2[0] else ""
            if c1 == c2 and c1 in CONSONANTS:
                alliteration_count += 1

    # Internal rhyme: words within same line that rhyme
    for line in body_lines:
        words = [w.strip(".,;:!?—–-…\"'»").lower() for w in line.split()]
        for a in range(len(words)):
            for b in range(a + 2, len(words)):
                if len(words[a]) >= 3 and len(words[b]) >= 3 and words[a][-3:] == words[b][-3:] and words[a] != words[b]:
                    internal_rhymes += 1

    return {
        "vowelConsonant": {
            "vowels": vowel_count,
            "consonants": consonant_count,
            "ratio": round(vowel_count / max(consonant_count, 1), 2),
        },
        "consonantClusters": {
            "count": len(clusters_found),
            "top": cluster_top,
        },
        "soundGroups": {
            "szumiace": szum_count,
            "syczace": syc_count,
            "nosowe": nasal_count,
            "plynne": liquid_count,
        },
        "rhymes": {
            "exact": exact_rhymes,
            "approximate": approx_rhymes,
            "internal": internal_rhymes,
            "assonance": assonance_count,
            "alliteration": alliteration_count,
        },
    }


# ════════════════════════════════════════════════════════════════════
# 4. METRICS
# ════════════════════════════════════════════════════════════════════

def analyze_metrics(body_lines: list, raw_body_lines: list):
    """
    Strophic structure, reading tempo, regularity.
    """
    # ── Strophic analysis ──
    # Split by blank lines in the raw body (preserving blanks)
    stanzas = []
    current = []
    for line in raw_body_lines:
        if line.strip() == "":
            if current:
                stanzas.append(current)
                current = []
        else:
            current.append(line)
    if current:
        stanzas.append(current)

    stanza_count = len(stanzas)
    lines_per_stanza = [len(s) for s in stanzas]
    is_regular = len(set(lines_per_stanza)) <= 1 and stanza_count > 1
    is_continuous = stanza_count <= 1

    # ── Reading tempo ──
    total_syllables = sum(count_syllables_line(l) for l in body_lines)
    # ~3 syllables per second for poetry reading
    estimated_seconds = round(total_syllables / 3)
    if estimated_seconds < 15:
        tempo_cat = "szybkie"
    elif estimated_seconds <= 30:
        tempo_cat = "umiarkowane"
    else:
        tempo_cat = "wolne"

    # ── Regularity ──
    # Check if syllable counts per line are regular
    syll_per_line = [count_syllables_line(l) for l in body_lines]
    if syll_per_line:
        syll_mean = statistics.mean(syll_per_line)
        syll_stdev = statistics.stdev(syll_per_line) if len(syll_per_line) > 1 else 0
        regularity_score = round(1 - min(syll_stdev / max(syll_mean, 1), 1), 2)
    else:
        regularity_score = 0

    if regularity_score > 0.7:
        reg_type = "regularny"
    elif regularity_score > 0.4:
        reg_type = "polregularny"
    else:
        reg_type = "wolny"

    return {
        "strophic": {
            "stanzaCount": stanza_count,
            "linesPerStanza": lines_per_stanza,
            "isRegular": is_regular,
            "isContinuous": is_continuous,
        },
        "readingTempo": {
            "syllables": total_syllables,
            "estimatedSeconds": estimated_seconds,
            "tempoCategory": tempo_cat,
        },
        "regularity": {
            "type": reg_type,
            "regularityScore": regularity_score,
        },
    }


# ════════════════════════════════════════════════════════════════════
# Legacy analysis (semantics) — kept for backward compat
# ════════════════════════════════════════════════════════════════════

def analyze_semantics(doc, body_text: str):
    """Semantic fields, binary oppositions."""
    lemmas = [t.lemma_.lower() for t in doc if not t.is_punct and not t.is_space]
    words_lower = [t.text.lower() for t in doc if not t.is_punct and not t.is_space]

    fields = {}
    for field, keywords in SEMANTIC_FIELDS.items():
        count = sum(1 for w in words_lower if w in keywords)
        count += sum(1 for l in lemmas if l in keywords)
        fields[field] = count // 2

    word_set = set(words_lower + lemmas)
    oppositions_found = []
    for w1, w2 in OPPOSITIONS:
        if w1 in word_set and w2 in word_set:
            oppositions_found.append(f"{w1}/{w2}")

    return {
        "semanticFields": fields,
        "oppositionsFound": oppositions_found,
    }


# ════════════════════════════════════════════════════════════════════
# Full poem analysis
# ════════════════════════════════════════════════════════════════════

nlp_model = None

def get_nlp():
    global nlp_model
    if nlp_model is None:
        print("Loading spaCy pl_core_news_lg...")
        nlp_model = spacy.load("pl_core_news_lg")
    return nlp_model


def analyze_poem_full(path: Path) -> dict | None:
    """Full analysis of a single poem. Returns dict with 4 top keys."""
    title, body_text, body_lines, raw_body_lines = parse_poem(path)

    if not body_text.strip():
        return None

    nlp = get_nlp()
    doc = nlp(body_text)

    morphology = analyze_morphology(doc, body_text)
    syntax = analyze_syntax(body_lines, doc)
    phonetics = analyze_phonetics(body_text, body_lines)
    metrics = analyze_metrics(body_lines, raw_body_lines)
    semantics = analyze_semantics(doc, body_text)

    return {
        "morphology": morphology,
        "syntax": syntax,
        "phonetics": phonetics,
        "metrics": metrics,
        # Keep semantics in the nlp sub-object for backward compat
        "_semantics": semantics,
    }


# ════════════════════════════════════════════════════════════════════
# Corpus aggregation
# ════════════════════════════════════════════════════════════════════

def build_corpus(all_poem_data: list[dict]) -> dict:
    """Aggregate all poem-level data into corpus-level stats."""
    # Accumulators
    total_pos = Counter()
    total_verb_sem = Counter()
    total_adj_types = Counter()
    total_sent_types = Counter()
    total_pronouns = Counter()
    total_negation = Counter()
    all_adverbs = Counter()
    noun_concrete_total = 0
    noun_abstract_total = 0
    all_sentence_means = []
    all_line_word_means = []
    all_vowel_ratios = []
    all_consonant_cluster_counts = []
    all_enjamb_pcts = []
    all_tempos = []
    all_syllables = []
    all_regularity_scores = []
    tempo_cats = Counter()

    for d in all_poem_data:
        m = d.get("morphology", {})
        s = d.get("syntax", {})
        p = d.get("phonetics", {})
        mt = d.get("metrics", {})

        # POS
        for pos, count in m.get("pos", {}).items():
            total_pos[pos] += count

        # Verb semantics
        for cat, count in m.get("verbSemantics", {}).items():
            total_verb_sem[cat] += count

        # Adj types
        for cat, count in m.get("adjectiveTypes", {}).items():
            total_adj_types[cat] += count

        # Sentence types
        for cat, count in s.get("sentenceTypes", {}).items():
            total_sent_types[cat] += count

        # Pronouns
        for cat, count in m.get("pronouns", {}).items():
            total_pronouns[cat] += count

        # Negations
        neg = m.get("negations", {})
        for key in ("nie", "nic", "nikt", "nigdy", "nigdzie", "zaden"):
            total_negation[key] += neg.get(key, 0)

        # Nouns
        nca = m.get("nounConcreteAbstract", {})
        noun_concrete_total += nca.get("concrete", 0)
        noun_abstract_total += nca.get("abstract", 0)

        # Adverbs
        for item in m.get("adverbs", {}).get("top", []):
            all_adverbs[item["word"]] += item["count"]

        # Sentence lengths
        sl = s.get("sentenceLength", {})
        if sl.get("mean"):
            all_sentence_means.append(sl["mean"])

        # Line lengths
        ll = s.get("lineLength", {})
        if ll.get("meanWords"):
            all_line_word_means.append(ll["meanWords"])

        # Phonetics
        vc = p.get("vowelConsonant", {})
        if vc.get("ratio"):
            all_vowel_ratios.append(vc["ratio"])
        cc = p.get("consonantClusters", {})
        all_consonant_cluster_counts.append(cc.get("count", 0))

        # Enjambement
        enj = s.get("enjambement", {})
        all_enjamb_pcts.append(enj.get("percent", 0))

        # Tempo
        rt = mt.get("readingTempo", {})
        if rt.get("estimatedSeconds"):
            all_tempos.append(rt["estimatedSeconds"])
            all_syllables.append(rt.get("syllables", 0))
            tempo_cats[rt.get("tempoCategory", "?")] += 1

        # Regularity
        reg = mt.get("regularity", {})
        if reg.get("regularityScore") is not None:
            all_regularity_scores.append(reg["regularityScore"])

    n = len(all_poem_data) or 1

    def safe_mean(lst):
        return round(statistics.mean(lst), 2) if lst else 0

    total_pos_sum = sum(total_pos.values()) or 1

    return {
        "poemCount": len(all_poem_data),
        "posDistribution": dict(total_pos.most_common()),
        "posPercent": {k: round(v / total_pos_sum, 3) for k, v in total_pos.most_common()},
        "verbSemantics": dict(total_verb_sem.most_common()),
        "adjectiveTypes": dict(total_adj_types),
        "sentenceTypes": dict(total_sent_types),
        "pronouns": dict(total_pronouns),
        "negations": dict(total_negation.most_common()),
        "nounConcreteAbstract": {
            "concrete": noun_concrete_total,
            "abstract": noun_abstract_total,
            "ratio": round(noun_concrete_total / max(noun_concrete_total + noun_abstract_total, 1), 2),
        },
        "topAdverbs": [{"word": w, "count": c} for w, c in all_adverbs.most_common(20)],
        "avgSentenceLength": safe_mean(all_sentence_means),
        "avgLineWordsPerLine": safe_mean(all_line_word_means),
        "avgVowelConsonantRatio": safe_mean(all_vowel_ratios),
        "avgConsonantClusters": safe_mean([float(x) for x in all_consonant_cluster_counts]),
        "avgEnjambementPercent": safe_mean(all_enjamb_pcts),
        "avgReadingSeconds": safe_mean([float(x) for x in all_tempos]),
        "avgSyllables": safe_mean([float(x) for x in all_syllables]),
        "avgRegularityScore": safe_mean(all_regularity_scores),
        "tempoDistribution": dict(tempo_cats),
    }


# ════════════════════════════════════════════════════════════════════
# Main
# ════════════════════════════════════════════════════════════════════

def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    CORPUS_PATH.parent.mkdir(parents=True, exist_ok=True)

    poem_files = sorted(POEMS_DIR.glob("*.txt"))
    print(f"Found {len(poem_files)} poems in {POEMS_DIR}")

    all_poem_nlp = []  # collect for corpus aggregation

    for i, poem_path in enumerate(poem_files):
        poem_id = poem_path.stem
        analysis_path = OUTPUT_DIR / f"{poem_id}.json"

        if (i + 1) % 50 == 0 or i == 0:
            print(f"  [{i+1}/{len(poem_files)}] Processing {poem_path.name}...")

        # Load existing JSON
        existing = {}
        if analysis_path.exists():
            try:
                existing = json.loads(analysis_path.read_text(encoding="utf-8"))
            except json.JSONDecodeError:
                existing = {}

        # Always re-analyze (overwrite morphology/syntax/phonetics/metrics)
        result = analyze_poem_full(poem_path)
        if result is None:
            continue

        # Merge into existing — set new top-level keys, preserve others
        existing["morphology"] = result["morphology"]
        existing["syntax"] = result["syntax"]
        existing["phonetics"] = result["phonetics"]
        existing["metrics"] = result["metrics"]

        # Also update the legacy nlp block for backward compat
        if "nlp" not in existing:
            existing["nlp"] = {}
        existing["nlp"]["semantics"] = result["_semantics"]
        existing["nlp"]["morphology"] = result["morphology"]
        existing["nlp"]["phonetics"] = result["phonetics"]
        existing["nlp"]["syntax"] = result["syntax"]
        existing["nlp"]["tempo"] = result["metrics"].get("readingTempo", {})

        # Write
        analysis_path.write_text(
            json.dumps(existing, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

        # Collect for corpus
        all_poem_nlp.append(result)

    # ── Corpus ──
    print(f"\nBuilding corpus aggregation for {len(all_poem_nlp)} poems...")
    corpus_nlp = build_corpus(all_poem_nlp)

    # Load existing corpus, merge
    corpus = {}
    if CORPUS_PATH.exists():
        try:
            corpus = json.loads(CORPUS_PATH.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            corpus = {}

    corpus["nlp"] = corpus_nlp

    CORPUS_PATH.write_text(
        json.dumps(corpus, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    # ── Summary ──
    print(f"\nDone! Processed {len(all_poem_nlp)} poems.")
    print(f"  POS top-5: {dict(list(corpus_nlp['posDistribution'].items())[:5])}")
    print(f"  Verb semantics: {corpus_nlp['verbSemantics']}")
    print(f"  Sentence types: {corpus_nlp['sentenceTypes']}")
    print(f"  Avg reading: {corpus_nlp['avgReadingSeconds']}s")
    print(f"  Tempo dist: {corpus_nlp['tempoDistribution']}")
    print(f"  Negations: {corpus_nlp['negations']}")
    print(f"  Pronouns: {corpus_nlp['pronouns']}")
    print(f"  Noun concrete/abstract: {corpus_nlp['nounConcreteAbstract']}")


if __name__ == "__main__":
    main()
