export interface ChecklistItem {
    id: string;
    text: string;
    isRepeated?: boolean;
    year?: string;
}

export interface UnitSection {
    title: string;
    items: ChecklistItem[];
}

export interface Unit {
    id: string;
    title: string;
    sections: UnitSection[];
}

export const examContent: Unit[] = [
    {
        id: "unit-1",
        title: "UNIT 1 – SETS & RELATIONS",
        sections: [
            {
                title: "Important Topics",
                items: [
                    { id: "u1-it-1", text: "Set identities & laws" },
                    { id: "u1-it-2", text: "Analytical proof of identities" },
                    { id: "u1-it-3", text: "Poset definition" },
                    { id: "u1-it-4", text: "Hasse diagram construction" },
                    { id: "u1-it-5", text: "Partial order proof" },
                    { id: "u1-it-6", text: "Equivalence class" },
                    { id: "u1-it-7", text: "Properties of relations" },
                ]
            },
            {
                title: "Analytical Set Identity Proofs (Repeated)",
                items: [
                    { id: "u1-rep-1", text: "Prove A ∩ (B − C) = (A ∩ B) − (A ∩ C)", isRepeated: true, year: "May 2024" },
                    { id: "u1-rep-2", text: "Prove (A ∩ B) − C = (A − C) ∩ (B − C)", isRepeated: true, year: "July 2024" },
                    { id: "u1-rep-3", text: "Prove A – (B ∩ C) = (A – B) ∪ (A – C)", isRepeated: true, year: "July 2025" },
                ]
            },
            {
                title: "Hasse Diagram Repeats",
                items: [
                    { id: "u1-hasse-1", text: "Hasse diagram for P={(a,b)/‘a divides b’} on {1,2,3,4,5,6,7,8}", isRepeated: true, year: "May 2024" },
                    { id: "u1-hasse-2", text: "Hasse diagram for divisibility on {2,4,5,10,12,20,25}", isRepeated: true, year: "July 2024" },
                    { id: "u1-hasse-3", text: "Hasse diagram for {(A,B)/A ≤ B} on P(S) where S={a,b,c}", isRepeated: true, year: "Nov 2024" },
                ]
            },
            {
                title: "Revision",
                items: [
                    { id: "u1-rev-1", text: "Practice 2 identity proofs" },
                    { id: "u1-rev-2", text: "Draw 2 Hasse diagrams" },
                ]
            }
        ]
    },
    {
        id: "unit-2",
        title: "UNIT 2 – FUNCTIONS / PIGEONHOLE / EUCLID",
        sections: [
            {
                title: "Important Topics",
                items: [
                    { id: "u2-it-1", text: "Pigeonhole principle" },
                    { id: "u2-it-2", text: "Counting + permutations" },
                    { id: "u2-it-3", text: "Functions: 1-1 / onto" },
                    { id: "u2-it-4", text: "Euclid algorithm" },
                    { id: "u2-it-5", text: "expressing gcd = ax+by" },
                ]
            },
            {
                title: "Euclid Algorithm (Repeated)",
                items: [
                    { id: "u2-euc-1", text: "Find m,n for 512m + 320n = 64", isRepeated: true, year: "Dec 2023" },
                    { id: "u2-euc-2", text: "Find m,n for 28844m + 15712n = 4", isRepeated: true, year: "May 2024" },
                    { id: "u2-euc-3", text: "Find m,n for 512m + 320m = 64", isRepeated: true, year: "July 2024" },
                    { id: "u2-euc-4", text: "Find gcd of (18,19,35,87) and express as linear combination", isRepeated: true, year: "May 2025" },
                    { id: "u2-euc-5", text: "Find x,y for 154x + 250y = 2", isRepeated: true, year: "July 2025" },
                ]
            },
            {
                title: "Pigeonhole Repeated",
                items: [
                    { id: "u2-pig-1", text: "Ways 7 persons can be seated round a table", isRepeated: true },
                    { id: "u2-pig-2", text: "Min students for 4 guaranteed same grade", isRepeated: true },
                    { id: "u2-pig-3", text: "Ways 7 beads can be arranged to form a necklace", isRepeated: true },
                ]
            },
            {
                title: "Revision",
                items: [
                    { id: "u2-rev-1", text: "Solve 2 Euclid algorithm problems" },
                    { id: "u2-rev-2", text: "Solve 2 Pigeonhole problems" },
                ]
            }
        ]
    },
    {
        id: "unit-3",
        title: "UNIT 3 – LOGIC & PROOF",
        sections: [
            {
                title: "Important Topics",
                items: [
                    { id: "u3-it-1", text: "Rules of inference" },
                    { id: "u3-it-2", text: "Invalid argument proof" },
                    { id: "u3-it-3", text: "Indirect proof" },
                    { id: "u3-it-4", text: "Contradiction proof" },
                    { id: "u3-it-5", text: "Inconsistency proof" },
                    { id: "u3-it-6", text: "tautology" },
                ]
            },
            {
                title: "Repeated Questions",
                items: [
                    { id: "u3-rep-1", text: "Show premises p→q, q→¬r, r, therefore p∨(t∧s) are inconsistent", isRepeated: true },
                    { id: "u3-rep-2", text: "Construct argument: ‘Rama works hard…’ → ‘Rama will not get a job’", isRepeated: true },
                    { id: "u3-rep-3", text: "Prove premises p→q, q→r, s→r and p∧s are inconsistent", isRepeated: true, year: "May 2024" },
                    { id: "u3-rep-4", text: "Show inconsistent: If Rama gets his degree…etc.", isRepeated: true, year: "Jan 2024 / May 2025" },
                ]
            },
            {
                title: "Revision",
                items: [
                    { id: "u3-rev-1", text: "Rewrite 2 inconsistency proofs" },
                    { id: "u3-rev-2", text: "Redo 2 conclusion-derivation questions" },
                ]
            }
        ]
    },
    {
        id: "unit-4",
        title: "UNIT 4 – GROUP THEORY",
        sections: [
            {
                title: "Important Topics",
                items: [
                    { id: "u4-it-1", text: "subgroup tests" },
                    { id: "u4-it-2", text: "abelian proofs" },
                    { id: "u4-it-3", text: "cyclic subgroup results" },
                    { id: "u4-it-4", text: "induction proof" },
                ]
            },
            {
                title: "Repeated Questions",
                items: [
                    { id: "u4-rep-1", text: "Prove condition for subset H to be subgroup is a,b∈H ⇒ a*b⁻¹∈H", isRepeated: true },
                    { id: "u4-rep-2", text: "If a*b=a+b−ab prove (R,*) is abelian", isRepeated: true, year: "July 2024 / Nov 2024" },
                    { id: "u4-rep-3", text: "Prove by induction 8ⁿ−3ⁿ is divisible by 5", isRepeated: true, year: "Nov 2024, May 2025" },
                    { id: "u4-rep-4", text: "Prove every subgroup of a cyclic group is cyclic", isRepeated: true, year: "July 2024" },
                ]
            },
            {
                title: "Revision",
                items: [
                    { id: "u4-rev-1", text: "3 subgroup proofs" },
                    { id: "u4-rev-2", text: "2 abelian proofs" },
                    { id: "u4-rev-3", text: "2 induction proofs" },
                ]
            }
        ]
    },
    {
        id: "unit-5",
        title: "UNIT 5 – GRAPHS & TREES",
        sections: [
            {
                title: "Important Topics",
                items: [
                    { id: "u5-it-1", text: "Graphs" },
                    { id: "u5-it-2", text: "Handshaking problem" },
                    { id: "u5-it-3", text: "Special simple graph" },
                    { id: "u5-it-4", text: "Graph isomorphism" },
                    { id: "u5-it-5", text: "Matrix representation" },
                    { id: "u5-it-6", text: "Graph coloring" },
                    { id: "u5-it-7", text: "Trees" },
                    { id: "u5-it-8", text: "Spanning trees" },
                ]
            },
            {
                title: "Repeated Questions",
                items: [
                    { id: "u5-rep-1", text: "Find MST using Kruskal's algorithm", isRepeated: true },
                ]
            }
        ]
    }
];
