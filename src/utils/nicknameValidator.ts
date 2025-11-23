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

    // Check for restricted words (case-insensitive)
    const restrictedWords = ['milind'];
    const lowerNickname = trimmed.toLowerCase();

    for (const word of restrictedWords) {
        if (lowerNickname.includes(word)) {
            return { valid: false, error: 'This nickname is not allowed' };
        }
    }

    return { valid: true };
};
