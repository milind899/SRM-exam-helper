import type { Unit } from './examContent';

export const computerNetworks: Unit[] = [
    {
        id: "unit-1",
        title: "UNIT 1 – Introduction to Networks",
        sections: [
            {
                title: "Topics To Study",
                items: [
                    { id: "cn-u1-1", text: "Types of Networks (LAN, MAN, PAN, WAN)" },
                    { id: "cn-u1-2", text: "Network Topologies – BUS, RING, STAR, MESH, HYBRID" },
                    { id: "cn-u1-3", text: "Switching – Circuit Switching, Packet Switching" },
                    { id: "cn-u1-4", text: "OSI Model (all layers)" },
                    { id: "cn-u1-5", text: "TCP/IP Model" },
                    { id: "cn-u1-6", text: "Physical Media (Twisted pair, Coaxial, Fiber optic, Wireless)" },
                    { id: "cn-u1-7", text: "Performance: Bandwidth, Delay, Latency" },
                ]
            },
            {
                title: "PYQ – Must Do (Repeated)",
                items: [
                    { id: "cn-u1-pyq-1", text: "Explain network topologies with diagram", isRepeated: true },
                    { id: "cn-u1-pyq-2", text: "OSI Model – explain working", isRepeated: true },
                    { id: "cn-u1-pyq-3", text: "Role of Network Layer", isRepeated: true },
                    { id: "cn-u1-pyq-4", text: "Advantages & disadvantages of topologies", isRepeated: true },
                ]
            }
        ]
    },
    {
        id: "unit-2",
        title: "UNIT 2 – Addressing",
        sections: [
            {
                title: "Topics To Study",
                items: [
                    { id: "cn-u2-1", text: "IPv4 Addressing" },
                    { id: "cn-u2-2", text: "Address Space" },
                    { id: "cn-u2-3", text: "Classful Addressing" },
                    { id: "cn-u2-4", text: "Subnetting" },
                    { id: "cn-u2-5", text: "VLSM" },
                    { id: "cn-u2-6", text: "FLSM" },
                    { id: "cn-u2-7", text: "NAT" },
                    { id: "cn-u2-8", text: "Supernetting" },
                    { id: "cn-u2-9", text: "Network Devices: Hub, Repeater, Switch, Bridge, Router" },
                ]
            },
            {
                title: "PYQ – Must Do (Repeated)",
                items: [
                    { id: "cn-u2-pyq-1", text: "Subnet problems", isRepeated: true },
                    { id: "cn-u2-pyq-2", text: "VLSM subnet sizing", isRepeated: true },
                    { id: "cn-u2-pyq-3", text: "ISP allocation problems", isRepeated: true },
                    { id: "cn-u2-pyq-4", text: "Broadcasting address / subnet mask calculations", isRepeated: true },
                    { id: "cn-u2-pyq-5", text: "Find hosts, broadcast, first and last host", isRepeated: true },
                ]
            }
        ]
    },
    {
        id: "unit-3",
        title: "UNIT 3 – Routing",
        sections: [
            {
                title: "Topics To Study",
                items: [
                    { id: "cn-u3-1", text: "Forwarding of IP packets" },
                    { id: "cn-u3-2", text: "Static vs Default Routing" },
                    { id: "cn-u3-3", text: "Unicast Routing Algorithms (Distance Vector, Link State, Path Vector)" },
                    { id: "cn-u3-4", text: "Routing protocols: RIP v1, RIP v2, OSPF, BGP, EIGRP" },
                    { id: "cn-u3-5", text: "Multicast basics" },
                    { id: "cn-u3-6", text: "IPv6 addressing basics" },
                ]
            },
            {
                title: "PYQ – Must Do (Repeated)",
                items: [
                    { id: "cn-u3-pyq-1", text: "Explain Link State Routing with example", isRepeated: true },
                    { id: "cn-u3-pyq-2", text: "BGP explanation", isRepeated: true },
                    { id: "cn-u3-pyq-3", text: "Compare RIP vs OSPF vs BGP", isRepeated: true },
                    { id: "cn-u3-pyq-4", text: "Routing table construction questions", isRepeated: true },
                ]
            }
        ]
    },
    {
        id: "unit-4",
        title: "UNIT 4 – Medium Access Control",
        sections: [
            {
                title: "Topics To Study",
                items: [
                    { id: "cn-u4-1", text: "ALOHA (Pure + Slotted)" },
                    { id: "cn-u4-2", text: "CSMA / CD" },
                    { id: "cn-u4-3", text: "CSMA / CA" },
                    { id: "cn-u4-4", text: "Ethernet" },
                    { id: "cn-u4-5", text: "Token Ring" },
                    { id: "cn-u4-6", text: "Flow Control" },
                    { id: "cn-u4-7", text: "Stop and Wait ARQ" },
                    { id: "cn-u4-8", text: "Sliding Window ARQ" },
                    { id: "cn-u4-9", text: "Error detection (Parity, Checksum, CRC, Hamming Codes)" },
                    { id: "cn-u4-10", text: "HDLC" },
                    { id: "cn-u4-11", text: "PPP" },
                ]
            },
            {
                title: "PYQ – Must Do (Repeated)",
                items: [
                    { id: "cn-u4-pyq-1", text: "CSMA/CA – how collision avoided", isRepeated: true },
                    { id: "cn-u4-pyq-2", text: "Token Management + Token Ring", isRepeated: true },
                    { id: "cn-u4-pyq-3", text: "CRC numerical problems", isRepeated: true },
                    { id: "cn-u4-pyq-4", text: "Sliding window protocol", isRepeated: true },
                    { id: "cn-u4-pyq-5", text: "Error control mechanisms", isRepeated: true },
                ]
            }
        ]
    },
    {
        id: "unit-5",
        title: "UNIT 5 – Transport & Application Layer Protocols",
        sections: [
            {
                title: "Topics To Study",
                items: [
                    { id: "cn-u5-1", text: "Port Numbers" },
                    { id: "cn-u5-2", text: "UDP" },
                    { id: "cn-u5-3", text: "TCP" },
                    { id: "cn-u5-4", text: "TCP Header Format & Services" },
                    { id: "cn-u5-5", text: "TCP Connection (Three-way handshake, Termination)" },
                    { id: "cn-u5-6", text: "WWW" },
                    { id: "cn-u5-7", text: "HTTP" },
                    { id: "cn-u5-8", text: "FTP" },
                    { id: "cn-u5-9", text: "Email Protocols: SMTP, POP3, IMAP" },
                    { id: "cn-u5-10", text: "DNS" },
                    { id: "cn-u5-11", text: "Telnet" },
                ]
            },
            {
                title: "PYQ – Must Do (Repeated)",
                items: [
                    { id: "cn-u5-pyq-1", text: "Email Format + Architecture", isRepeated: true },
                    { id: "cn-u5-pyq-2", text: "TCP Header Format", isRepeated: true },
                    { id: "cn-u5-pyq-3", text: "Four-way handshake", isRepeated: true },
                    { id: "cn-u5-pyq-4", text: "SMTP / DNS / FTP explanations", isRepeated: true },
                ]
            }
        ]
    },
    {
        id: "important-numericals",
        title: "📊 Important Numericals",
        sections: [
            {
                title: "🟩 Highest Priority – Must Solve",
                items: [
                    { id: "cn-num-hp-1", text: "Subnetting (U2): Divide 192.168.10.0/24 into 6 subnets", isRepeated: true },
                    { id: "cn-num-hp-2", text: "VLSM (U2): Allocate blocks for 100, 50, 25, 10 hosts", isRepeated: true },
                    { id: "cn-num-hp-3", text: "CIDR + Route Aggregation (U2): Aggregate 4 networks", isRepeated: true },
                    { id: "cn-num-hp-4", text: "NAT Translation Table (U2): 5 devices mapping", isRepeated: true },
                    { id: "cn-num-hp-5", text: "Dijkstra Shortest Path (U3): Graph with 5 nodes", isRepeated: true },
                ]
            },
            {
                title: "🟨 High Priority – Very Likely in Exam",
                items: [
                    { id: "cn-num-h-1", text: "Bellman Ford Convergence Table (U3)", isRepeated: true },
                    { id: "cn-num-h-2", text: "CRC Polynomial Division (U4): Message + Generator", isRepeated: true },
                    { id: "cn-num-h-3", text: "Hamming Code (U4): Encode using Hamming(7,4)", isRepeated: true },
                    { id: "cn-num-h-4", text: "Go-Back-N Window Calculation (U4): 4-bit sequence", isRepeated: true },
                    { id: "cn-num-h-5", text: "Selective Repeat Window (U4): m=3 sequence bits", isRepeated: true },
                    { id: "cn-num-h-6", text: "ALOHA Throughput (U4): Pure vs Slotted", isRepeated: true },
                ]
            },
            {
                title: "🟦 Medium Priority – Askable",
                items: [
                    { id: "cn-num-m-1", text: "Transmission Delay (U1): Frame 8KB, Link 10Mbps" },
                    { id: "cn-num-m-2", text: "Propagation Delay (U1): Fiber 1200km" },
                    { id: "cn-num-m-3", text: "Total End-to-End Delay (U1)" },
                    { id: "cn-num-m-4", text: "Bandwidth Calculation (U1): Video stream 400KB/s" },
                ]
            },
            {
                title: "🟪 Lower Priority",
                items: [
                    { id: "cn-num-l-1", text: "TCP Throughput (U5): RTT 200ms, Window 32KB" },
                    { id: "cn-num-l-2", text: "RTT Estimation (U5): α=0.25" },
                    { id: "cn-num-l-3", text: "Congestion Window Growth (U5): Slow start" },
                    { id: "cn-num-l-4", text: "DNS Query Time (U5): 5 hops" },
                ]
            },
            {
                title: "🟫 Lowest Priority",
                items: [
                    { id: "cn-num-ll-1", text: "Baud Rate/Encoding (U1): 4-level signaling" },
                    { id: "cn-num-ll-2", text: "Shannon Capacity (U1): BW=4KHz, SNR=30dB" },
                ]
            }
        ]
    }
];
