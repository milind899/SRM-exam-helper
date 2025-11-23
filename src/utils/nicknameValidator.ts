// Comprehensive list of inappropriate words (case-insensitive)
const PROFANITY_LIST = [
    'milind', // Reserved name
    // Common profanity (keeping it family-friendly, adding patterns)
    'damn', 'hell', 'crap', 'fuck', 'shit', 'bitch', 'ass', 'bastard',
    'dick', 'cock', 'pussy', 'whore', 'slut', 'fag', 'nigga', 'nigger',
    'retard', 'rape', 'sex', 'porn', 'xxx', 'nude', 'naked',
    // Common variations and leetspeak
    'fuk', 'fck', 'sh1t', 'b1tch', 'a$$', 'Nazi', 'hitler',
    // Offensive terms
    'kill', 'death', 'murder', 'terrorist', 'bomb', 'weapon',
    // Spam/advertising
    'admin', 'moderator', 'official', 'support', 'verified'
];

// Utility function to validate nicknames
export const validateNickname = (nickname: string): { valid: boolean; error?: string } => {
    const trimmed = nickname.trim();

    // Check if empty
    if (!trimmed) {
        return { valid: false, error: 'Nickname cannot be empty' };
    }

    // Check length
    if (trimmed.length < 2) {
        return { valid: false, error: 'Nickname must be at least 2 characters' };
    }

    if (trimmed.length > 20) {
        return { valid: false, error: 'Nickname must be 20 characters or less' };
    }

    // Check for profanity and restricted words (case-insensitive)
    const lowerNickname = trimmed.toLowerCase();

    for (const word of PROFANITY_LIST) {
        if (lowerNickname.includes(word)) {
            return { valid: false, error: 'This nickname contains inappropriate content' };
        }
    }

    // Check for excessive numbers or special characters
    const specialCharCount = (trimmed.match(/[^a-zA-Z0-9]/g) || []).length;
    if (specialCharCount > 3) {
        return { valid: false, error: 'Too many special characters' };
    }

    return { valid: true };
};
