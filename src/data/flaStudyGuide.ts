export interface RoadmapTopic {
    name: string;
    videoNo: string;
}

export interface RoadmapUnit {
    title: string;
    videoRange: string;
    topics: RoadmapTopic[];
    outcomes: string[];
}

export interface Roadmap {
    author: string;
    playlistUrl: string;
    description: string;
    units: RoadmapUnit[];
    summary: { unit: string; range: string }[];
}

export const deebaRoadmap: Roadmap = {
    author: "Deeba Kannan",
    playlistUrl: "https://www.youtube.com/playlist?list=PLAeJqLIux2WMSxzieR45QVTftR-FskFJR",
    description: "Complete Study Roadmap - Mapped to Playlist",
    units: [
        {
            title: "UNIT 1 — Regular Languages, DFA, NFA, RE, Pumping Lemma",
            videoRange: "1 to 23",
            topics: [
                { name: "Intro to TOC", videoNo: "1" },
                { name: "Alphabet, String, Language", videoNo: "2" },
                { name: "Finite Automata Basics", videoNo: "3" },
                { name: "DFA & NFA Theory + Examples", videoNo: "4–7" },
                { name: "NFA → DFA (Subset Construction)", videoNo: "8" },
                { name: "RE → ε-NFA → DFA (Conversions)", videoNo: "9–13" },
                { name: "DFA → RE (Rijk formula)", videoNo: "14" },
                { name: "Moore & Mealy Machines + Conversions", videoNo: "15–19" },
                { name: "Closure Properties of Regular Languages", videoNo: "20" },
                { name: "Pumping Lemma for Regular Languages", videoNo: "21–23" }
            ],
            outcomes: [
                "Construct DFA/NFA from language/regex",
                "Convert NFA → DFA → minimized DFA",
                "Convert Regex → FA + vice-versa",
                "Apply Pumping Lemma to prove non-regularity"
            ]
        },
        {
            title: "UNIT 2 — Context Free Grammar, CNF, GNF, Ambiguity",
            videoRange: "24 to 38",
            topics: [
                { name: "Types of Grammar (Chomsky Hierarchy)", videoNo: "24" },
                { name: "CFG, Derivation, Parse Tree, Ambiguity", videoNo: "25" },
                { name: "CFG for CFL + More Examples", videoNo: "26–28" },
                { name: "Useless / Unit / ε-production Removal", videoNo: "29–31" },
                { name: "CNF — Definition + Examples", videoNo: "32–34" },
                { name: "GNF — Conversion + Examples", videoNo: "35–38" }
            ],
            outcomes: [
                "Design CFG for language generation",
                "Convert CFG to CNF & GNF (8–15M repeated)",
                "Remove ε, unit, useless productions",
                "Identify ambiguous grammar"
            ]
        },
        {
            title: "UNIT 3 — Pushdown Automata, CFL Properties, Pumping CFL",
            videoRange: "40 to 52 (skip 39)",
            topics: [
                { name: "Introduction to PDA", videoNo: "40" },
                { name: "PDA for aⁿbⁿ and Variants", videoNo: "41–45" },
                { name: "Deterministic PDA (DPDA)", videoNo: "46" },
                { name: "PDA Examples & Scenarios", videoNo: "47–48" },
                { name: "PDA to CFG Conversion", videoNo: "49" },
                { name: "CFG to PDA Conversion", videoNo: "50" },
                { name: "Closure Properties of CFL", videoNo: "51" },
                { name: "Pumping Lemma for CFL", videoNo: "52" }
            ],
            outcomes: [
                "Construct PDA for any language",
                "Convert PDA ↔ CFG",
                "Apply Pumping Lemma for CFL-s",
                "Solve closure property questions"
            ]
        },
        {
            title: "UNIT 4 — Turing Machine, TM Programs, Decidability",
            videoRange: "57 to 73",
            topics: [
                { name: "Introduction to TM", videoNo: "57" },
                { name: "Turing Machine Formal Representation", videoNo: "58" },
                { name: "TM Example Problems", videoNo: "59–64" },
                { name: "Complex TM Constructions (aⁿbⁿcⁿ)", videoNo: "65–71" },
                { name: "PDA + TM relation for CFL", videoNo: "72" },
                { name: "Variants of Turing Machine", videoNo: "73" }
            ],
            outcomes: [
                "Construct TM for arithmetic/string problems",
                "Write ID and transition functions clearly",
                "Handle multi-track/encoded TM questions",
                "Answer decidability questions confidently"
            ]
        },
        {
            title: "UNIT 5 — PCP, MPCP, Decidability, NP-Complete",
            videoRange: "74 to 88",
            topics: [
                { name: "Multi-track & Encodings", videoNo: "74–75" },
                { name: "Recursive & RE Languages", videoNo: "76–78" },
                { name: "P, NP, NP-Hard, NP-Complete", videoNo: "79–82" },
                { name: "Post Correspondence Problem (PCP)", videoNo: "83–87" },
                { name: "Decidable vs Undecidable Problems", videoNo: "88" }
            ],
            outcomes: [
                "PCP & MPCP proofs & examples",
                "Recursive vs RE languages",
                "NP vs NP-Complete vs NP-Hard",
                "Why PCP is undecidable"
            ]
        }
    ],
    summary: [
        { unit: "UNIT 1 — DFA/NFA/Regex/Regular Pumping", range: "1 → 23" },
        { unit: "UNIT 2 — CFG/CNF/GNF/Ambiguity", range: "24 → 38" },
        { unit: "UNIT 3 — PDA/CFL/Pumping Lemma (CFL)", range: "40 → 52" },
        { unit: "UNIT 4 — Turing Machine + Decidability", range: "57 → 73" },
        { unit: "UNIT 5 — PCP/NP/Rice/Undecidable", range: "74 → 88" }
    ]
};

export const anitaRoadmap: Roadmap = {
    author: "Anita R",
    playlistUrl: "https://www.youtube.com/playlist?list=PL6xbXi2C3sePDwyboAcu7l1UYuUT2SWYd",
    description: "Complete Study Roadmap",
    units: [
        {
            title: "UNIT 1 — Regular Languages | FA | DFA | NFA | Regex | Pumping",
            videoRange: "1 to 33",
            topics: [
                { name: "Basic Automata Theory Definitions", videoNo: "1" },
                { name: "Deductive/Inductive Proof", videoNo: "2–4" },
                { name: "DFA + NFA Introduction + Core Examples", videoNo: "5–11" },
                { name: "Extended Transition Functions (DFA/NFA)", videoNo: "12–13" },
                { name: "NFA → DFA (Subset Construction)", videoNo: "14–15" },
                { name: "ε-NFA, ε-Closure & Conversions", videoNo: "16–19" },
                { name: "Regular Expressions + Conversions", videoNo: "20–21" },
                { name: "DFA → RE (Rijk Method + State Elimination)", videoNo: "22–28" },
                { name: "Minimized DFA", videoNo: "29" },
                { name: "RE → DFA Conversion", videoNo: "30" },
                { name: "Pumping Lemma for Regular Languages", videoNo: "31–33" }
            ],
            outcomes: [
                "Construct/convert DFA–NFA–εNFA–RE",
                "Minimize DFA & Apply Pumping lemma",
                "Recognize/convert regular languages in all forms"
            ]
        },
        {
            title: "UNIT 2 — CFG, Parse Tree, CNF, GNF, Grammar Types",
            videoRange: "34 to 44",
            topics: [
                { name: "CFG Introduction + Derivation + Ambiguity", videoNo: "34" },
                { name: "CFG Construction + More Examples", videoNo: "35" },
                { name: "Types of Grammar", videoNo: "36" },
                { name: "Parse Tree + Derivation Example", videoNo: "37" },
                { name: "Ambiguous Grammar", videoNo: "38" },
                { name: "CNF – Theory & Example (Repeated Asked Topic)", videoNo: "39–41" },
                { name: "Left Recursion Removal", videoNo: "42" },
                { name: "GNF – Main + Example", videoNo: "43–44" }
            ],
            outcomes: [
                "Create CFG for any context-free language",
                "Remove ε, unit, useless, left recursion",
                "Convert CFG → CNF → GNF (Repeated 15M)"
            ]
        },
        {
            title: "UNIT 3 — PDA, CFL Properties, PDA↔CFG, Pumping (CFL)",
            videoRange: "45 to 55",
            topics: [
                { name: "PDA Intro & Base Example (0ⁿ1ⁿ)", videoNo: "45" },
                { name: "PDA Variants (aⁿb²ⁿ, mixed patterns)", videoNo: "46–48" },
                { name: "NPDA Example (wwʳ)", videoNo: "49" },
                { name: "DPDA Example (wcwʳ)", videoNo: "50" },
                { name: "CFG → PDA Conversion", videoNo: "51" },
                { name: "PDA → CFG Conversion", videoNo: "52" },
                { name: "Pumping Lemma for CFL", videoNo: "53–55" }
            ],
            outcomes: [
                "Construct PDA for most patterns",
                "Convert CFG ↔ PDA (important for unit 3)",
                "Prove non-CFL using pumping lemma"
            ]
        },
        {
            title: "UNIT 4 — Turing Machine | TM Programming",
            videoRange: "56 to 63",
            topics: [
                { name: "Introduction to TM", videoNo: "56" },
                { name: "TM Problem – Concatenation", videoNo: "57" },
                { name: "TM Problem – aⁿbⁿcⁿ", videoNo: "58" },
                { name: "TM Problem – Palindrome", videoNo: "59" },
                { name: "TM Problem – Subtraction", videoNo: "60" },
                { name: "TM Problem – Multiplication", videoNo: "61" },
                { name: "TM Problem – Substring", videoNo: "62" },
                { name: "Code Implementation for TM", videoNo: "63" }
            ],
            outcomes: [
                "You can WRITE ID + transition functions",
                "Solve construction problems fully",
                "Handle multi-step TM trace questions"
            ]
        },
        {
            title: "UNIT 5 — Undecidability | PCP | MPCP | TM Variants | NP-Class",
            videoRange: "64 to 72",
            topics: [
                { name: "Undecidability Basics", videoNo: "64" },
                { name: "PCP", videoNo: "65" },
                { name: "Modified PCP (MPCP)", videoNo: "66" },
                { name: "MPCP → PCP Conversion", videoNo: "67" },
                { name: "TM → MPCP Conversion", videoNo: "68" },
                { name: "TM Variants", videoNo: "69–71" },
                { name: "Storage in Finite Control", videoNo: "72" }
            ],
            outcomes: [
                "Why PCP & MPCP are undecidable",
                "Class P vs NP → intro to complexity",
                "How TM complexity grows via variants"
            ]
        }
    ],
    summary: [
        { unit: "Unit 1 — Regular Languages, DFA/NFA, RE, Pumping Regular", range: "1 → 33" },
        { unit: "Unit 2 — CFG / CNF / GNF / Ambiguity", range: "34 → 44" },
        { unit: "Unit 3 — PDA + CFL + Pumping CFL", range: "45 → 55" },
        { unit: "Unit 4 — Turing Machine Problems", range: "56 → 63" },
        { unit: "Unit 5 — PCP / Undecidability / TM Variants", range: "64 → 72" }
    ]
};
