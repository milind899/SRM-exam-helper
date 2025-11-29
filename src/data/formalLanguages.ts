import type { Unit } from './examContent';

export const formalLanguages: Unit[] = [
    {
        id: "fla-unit-1",
        title: "UNIT–1 — REGULAR LANGUAGES, DFA, NFA, REGEX",
        sections: [
            {
                title: "Important Topics",
                items: [
                    // Videos 1-3: Intro, Alphabet/String/Language, FA Basics
                    // Videos 4-7: DFA & NFA Theory
                    {
                        id: "fla-u1-2",
                        text: "DFA vs NFA Comparison",
                        source: "PYQ 2025 (3) Q3 • PYQ 2024 (1) Q2, Q4",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Video 8: NFA → DFA
                    {
                        id: "fla-u1-5",
                        text: "ε-closure + NFA → DFA",
                        source: "PYQ 2025 (2) Q21(a),(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u1-3",
                        text: "DFA Minimization (Partition/Equivalence)",
                        source: "PYQ 2025 (1) Q8 • PYQ 2023 Q21(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 9-14: RE ↔ FA Conversions
                    {
                        id: "fla-u1-1",
                        text: "Regular Expression → Language Identification",
                        source: "PYQ 2025 (1) Q1, Q3 • PYQ 2024 (2) Q1, Q3 • PYQ 2023 Q1, Q3",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u1-4",
                        text: "Construct DFA from RE (Repeated 8 marks)",
                        source: "PYQ 2025 (1) Q21(a) • PYQ 2024 (1) Q21(a) • PYQ 2023 Q21(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 15-19: Moore & Mealy (not in current topics, skip)
                    // Video 20: Closure Properties (not explicitly listed)
                    // Videos 21-23: Pumping Lemma
                    {
                        id: "fla-u1-6",
                        text: "Non-regular Proof / Limitations of FA",
                        source: "PYQ 2024 (2) Q2",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                ]
            }
        ]
    },
    {
        id: "fla-unit-2",
        title: "UNIT–2 — CFG, CNF, GNF, AMBIGUITY",
        sections: [
            {
                title: "Important Topics",
                items: [
                    // Video 24: Chomsky Hierarchy
                    {
                        id: "fla-u2-4",
                        text: "Grammar Type Classification (Chomsky Hierarchy)",
                        source: "PYQ 2024 (2) Q6, Q7, Q8 • PYQ 2025 (3) Q10, Q12",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 25-28: CFG, Derivation, Parse Tree, Ambiguity
                    {
                        id: "fla-u2-3",
                        text: "Ambiguous Grammar + Example",
                        source: "PYQ 2025 (3) Q22(a) • PYQ 2024 (1) Q22(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 29-31: Remove useless/unit/ε productions
                    {
                        id: "fla-u2-2",
                        text: "Remove Null / Unit / Useless Productions",
                        source: "PYQ 2025 (3) Q22(a) • PYQ 2024 (1) Q22(a) • PYQ 2025 (1) Q22(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 32-38: CNF and GNF
                    {
                        id: "fla-u2-1",
                        text: "CFG → CNF/GNF Conversion (Most repeated 8–15 marks!)",
                        source: "PYQ 2025 (1) Q22(b), Q26 • PYQ 2025 (3) Q22(b), Q24(a) • PYQ 2024 (2) Q24(a) • PYQ 2023 Q22(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                ]
            }
        ]
    },
    {
        id: "fla-unit-3",
        title: "UNIT–3 — PDA, CFL, CLOSURE & PUMPING LEMMA",
        sections: [
            {
                title: "Important Topics",
                items: [
                    // Videos 40-45: PDA Introduction and aⁿbⁿ
                    {
                        id: "fla-u3-1",
                        text: "PDA Construction for aⁿbⁿ / equal a & b (100% asked)",
                        source: "PYQ 2025 (1) Q23(a) • PYQ 2025 (3) Q23(a) • PYQ 2024 (1) Q23 • PYQ 2023 Q23(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Video 46: DPDA
                    {
                        id: "fla-u3-3",
                        text: "DPDA vs NPDA",
                        source: "PYQ 2025 (3) Q23(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 49-50: PDA ↔ CFG
                    {
                        id: "fla-u3-2",
                        text: "PDA ↔ CFG Conversion",
                        source: "PYQ 2025 (1) Q23(b) • PYQ 2025 (3) Q23(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 51-52: Closure Properties & Pumping Lemma
                    {
                        id: "fla-u3-4",
                        text: "CFL Closure Properties & Pumping Lemma",
                        source: "PYQ 2025 (1) Q24(b) • PYQ 2025 (3) Q26(1)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                ]
            }
        ]
    },
    {
        id: "fla-unit-4",
        title: "UNIT–4 — TURING MACHINE & DECIDABILITY",
        sections: [
            {
                title: "Important Topics",
                items: [
                    // Videos 57-58: TM Introduction & Formal Representation
                    {
                        id: "fla-u4-2",
                        text: "Instantaneous Description & TM Tuple Format",
                        source: "PYQ 2025 (3) Q24(a) • PYQ 2024 (2) MCQ Q14, Q15, Q16",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 59-71: TM Example Problems & Complex Constructions
                    {
                        id: "fla-u4-1",
                        text: "TM for addition, subtraction, unary operations",
                        source: "PYQ 2025 (1) Q24(a), Q25(a) • PYQ 2025 (3) Q24(a), Q27",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Videos 72-73: PDA+TM relation, Variants, Decidability
                    {
                        id: "fla-u4-3",
                        text: "Decidable vs Undecidable",
                        source: "PYQ 2025 (1) Q25(b) • PYQ 2025 (3) Q25(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                ]
            }
        ]
    },
    {
        id: "fla-unit-5",
        title: "UNIT–5 — PCP, RICE THEOREM, NP-COMPLEXITY",
        sections: [
            {
                title: "Important Topics",
                items: [
                    // Videos 74-78: Multi-track, Recursive & RE Languages
                    {
                        id: "fla-u5-4",
                        text: "Recursive, RE, CSL Hierarchy",
                        source: "PYQ 2025 (1) Q19,Q20 • PYQ 2024 (2) Q18,Q19 • PYQ 2023 Q16,Q18",
                        link: "#"
                    },
                    // Videos 79-82: P, NP, NP-Complete
                    {
                        id: "fla-u5-3",
                        text: "P vs NP, NP-Hard, NP-Complete",
                        source: "PYQ 2024 (1) Q25(a) • PYQ 2024 (2) Q25(b)",
                        link: "#"
                    },
                    // Videos 83-87: PCP
                    {
                        id: "fla-u5-1",
                        text: "PCP & Modified PCP",
                        source: "PYQ 2025 (1) Q18, Q26 • PYQ 2025 (3) Q26(a),(b) • PYQ 2024 (2) Q25(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    // Video 88: Decidable vs Undecidable (Rice Theorem fits here)
                    {
                        id: "fla-u5-2",
                        text: "Rice Theorem",
                        source: "PYQ 2024 (2) Q25(b), Q26(a) • PYQ 2025 (3) Q25(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                ]
            }
        ]
    }
];
