import type { Unit } from './examContent';

export const formalLanguages: Unit[] = [
    {
        id: "fla-unit-1",
        title: "UNIT–1 — REGULAR LANGUAGES, DFA, NFA, REGEX (CO-1)",
        sections: [
            {
                title: "Important Topics",
                items: [
                    {
                        id: "fla-u1-1",
                        text: "Regular Expression → Language Identification",
                        source: "PYQ 2025 (1) Q1, Q3 • PYQ 2024 (2) Q1, Q3 • PYQ 2023 Q1, Q3",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u1-2",
                        text: "DFA vs NFA Comparison",
                        source: "PYQ 2025 (3) Q3 • PYQ 2024 (1) Q2, Q4",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u1-3",
                        text: "DFA Minimization (Partition/Equivalence)",
                        source: "PYQ 2025 (1) Q8 • PYQ 2023 Q21(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u1-4",
                        text: "Construct DFA from RE (Repeated 8 marks)",
                        source: "PYQ 2025 (1) Q21(a) • PYQ 2024 (1) Q21(a) • PYQ 2023 Q21(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u1-5",
                        text: "ε-closure + NFA → DFA",
                        source: "PYQ 2025 (2) Q21(a),(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
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
        title: "UNIT–2 — CFG, CNF, GNF, AMBIGUITY (CO-2)",
        sections: [
            {
                title: "Important Topics",
                items: [
                    {
                        id: "fla-u2-1",
                        text: "CFG → CNF/GNF Conversion (Most repeated 8–15 marks!)",
                        source: "PYQ 2025 (1) Q22(b), Q26 • PYQ 2025 (3) Q22(b), Q24(a) • PYQ 2024 (2) Q24(a) • PYQ 2023 Q22(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u2-2",
                        text: "Remove Null / Unit / Useless Productions",
                        source: "PYQ 2025 (3) Q22(a) • PYQ 2024 (1) Q22(a) • PYQ 2025 (1) Q22(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u2-3",
                        text: "Ambiguous Grammar + Example",
                        source: "PYQ 2025 (3) Q22(a) • PYQ 2024 (1) Q22(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u2-4",
                        text: "Grammar Type Classification (Chomsky Hierarchy)",
                        source: "PYQ 2024 (2) Q6, Q7, Q8 • PYQ 2025 (3) Q10, Q12",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                ]
            }
        ]
    },
    {
        id: "fla-unit-3",
        title: "UNIT–3 — PDA, CFL, CLOSURE & PUMPING LEMMA (CO-3)",
        sections: [
            {
                title: "Important Topics",
                items: [
                    {
                        id: "fla-u3-1",
                        text: "PDA Construction for aⁿbⁿ / equal a & b (100% asked)",
                        source: "PYQ 2025 (1) Q23(a) • PYQ 2025 (3) Q23(a) • PYQ 2024 (1) Q23 • PYQ 2023 Q23(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u3-2",
                        text: "PDA ↔ CFG Conversion",
                        source: "PYQ 2025 (1) Q23(b) • PYQ 2025 (3) Q23(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u3-3",
                        text: "DPDA vs NPDA",
                        source: "PYQ 2025 (3) Q23(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
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
        title: "UNIT–4 — TURING MACHINE & DECIDABILITY (CO-4)",
        sections: [
            {
                title: "Important Topics",
                items: [
                    {
                        id: "fla-u4-1",
                        text: "TM for addition, subtraction, unary operations",
                        source: "PYQ 2025 (1) Q24(a), Q25(a) • PYQ 2025 (3) Q24(a), Q27",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u4-2",
                        text: "Instantaneous Description & TM Tuple Format",
                        source: "PYQ 2025 (3) Q24(a) • PYQ 2024 (2) MCQ Q14, Q15, Q16",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
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
        title: "UNIT–5 — PCP, RICE THEOREM, NP-COMPLEXITY (CO-5)",
        sections: [
            {
                title: "Important Topics",
                items: [
                    {
                        id: "fla-u5-1",
                        text: "PCP & Modified PCP",
                        source: "PYQ 2025 (1) Q18, Q26 • PYQ 2025 (3) Q26(a),(b) • PYQ 2024 (2) Q25(a)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u5-2",
                        text: "Rice Theorem",
                        source: "PYQ 2024 (2) Q25(b), Q26(a) • PYQ 2025 (3) Q25(b)",
                        link: "https://drive.google.com/drive/folders/1-4Tk085E-T59sLOhITJOBL90EMio4WBO?usp=sharing"
                    },
                    {
                        id: "fla-u5-3",
                        text: "P vs NP, NP-Hard, NP-Complete",
                        source: "PYQ 2024 (1) Q25(a) • PYQ 2024 (2) Q25(b)",
                        link: "#"
                    },
                    {
                        id: "fla-u5-4",
                        text: "Recursive, RE, CSL Hierarchy",
                        source: "PYQ 2025 (1) Q19,Q20 • PYQ 2024 (2) Q18,Q19 • PYQ 2023 Q16,Q18",
                        link: "#"
                    },
                ]
            }
        ]
    }
];
