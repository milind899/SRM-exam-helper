-- Clear existing questions (if any)
DELETE FROM questions;

-- Insert Unit 1 questions (first 20 as a sample - you can run this multiple times with different units)
INSERT INTO questions (unit, question, options, answer) VALUES
('UNIT 1', 'In the OSI model, encryption and decryption are functions of the ______ layer.', '{"A": "Transport", "B": "Session", "C": "Presentation", "D": "Application"}', 'C'),
('UNIT 1', 'The topology that involves tokens.', '{"A": "Star", "B": "Ring", "C": "Bus", "D": "Daisy-Chaining"}', 'B'),
('UNIT 1', 'LAN interconnects hosts; WAN interconnects connecting _______.', '{"A": "Networking devices", "B": "LANs", "C": "PCs", "D": "PANs"}', 'B'),
('UNIT 1', 'Which network topology is best suited for scenarios requiring high reliability & easy node addition?', '{"A": "Bus"', "B": "Mesh", "C": "Star", "D": "Ring"}', 'B'),
('UNIT 1', 'Which of the following is used in a typical circuit-switching network?', '{"A": "Datagram packet", "B": "Virtual circuit", "C": "FDM", "D": "TDM"}', 'B'),
('UNIT 1', 'In the layer hierarchy, when a packet moves from upper to lower layers, headers are _____.', '{"A": "Added", "B": "Removed", "C": "Rearranged", "D": "Modified"}', 'A'),
('UNIT 1', 'Which of the following primarily uses guided media?', '{"A": "Cellular telephone", "B": "Local telephone system", "C": "Satellite communication", "D": "Radio broadcasting"}', 'B'),
('UNIT 1', 'What is the frequency range of coaxial cable?', '{"A": "100 KHz – 500 MHz", "B": "100 MHz – 500 MHz", "C": "1000 KHz – 500 MHz", "D": "10 MHz – 50 MHz"}', 'A'),
('UNIT 1', '______ is a multiport repeater.', '{"A": "Hub", "B": "Bridge", "C": "Switch", "D": "Router"}', 'C'),
('UNIT 1', 'Which transmission medium is best in high-interference environments?', '{"A": "UTP", "B": "Coaxial Cable", "C": "Fiber Optic", "D": "STP"}', 'B');

-- Note: This is a sample of 10 questions. You can visit:
-- https://srm-exam-helper.vercel.app/api/setup_mcq
-- to seed ALL questions automatically from the backend!
