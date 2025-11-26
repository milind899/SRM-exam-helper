// Comprehensive profanity list (Hindi & English)
const PROFANITY_LIST = [
    // Reserved/Protected
    'milind', 'admin', 'moderator', 'mod', 'official', 'support', 'verified', 'staff', 'owner', 'developer', 'dev',

    // English Profanity
    'fuck', 'shit', 'bitch', 'ass', 'asshole', 'bastard', 'damn', 'crap',
    'dick', 'cock', 'penis', 'pussy', 'vagina', 'cunt', 'whore', 'slut',
    'sex', 'sexy', 'porn', 'nude', 'naked', 'boobs', 'tits', 'nipple',
    'rape', 'molest', 'nigger', 'nigga', 'fag', 'faggot', 'retard',
    'gay', 'lesbian', 'tranny', 'chink', 'spic', 'kill', 'murder', 'die',
    'terrorist', 'bomb', 'hitler', 'nazi', 'suicide', 'anal', 'anus',
    'scrotum', 'testicle', 'orgasm', 'ejaculate', 'semen', 'sperm',
    'dildo', 'masturbate', 'wank', 'wanker', 'bollocks', 'bugger',
    'chode', 'clit', 'clitoris', 'cum', 'cums', 'jizz', 'knob',
    'piss', 'poop', 'prick', 'pube', 'pubic', 'queer', 'rimjob',
    'skank', 'smegma', 'snatch', 'tit', 'tosser', 'turd', 'twat',
    'vibrator', 'vulva', 'wang', 'willy', 'xrated', 'xxx',

    // Hindi/Indian Profanity & Slang
    'chutiya', 'chutiye', 'chut', 'chod', 'chodu', 'gandu', 'gand', 'gaand',
    'madarchod', 'mc', 'bhenchod', 'bc', 'behenchod', 'benchod',
    'bhadwa', 'bhadwe', 'bhosad', 'bhosdi', 'bhosadike', 'bsdk',
    'lund', 'loda', 'lauda', 'land', 'lawda', 'lavda',
    'randi', 'rand', 'randwa', 'raand', 'chinaal',
    'kutta', 'kutti', 'kute', 'harami', 'haramzada', 'kamine', 'kamina',
    'saala', 'saale', 'saali', 'haramkhor',
    'bakchod', 'bakchodi', 'jhaat', 'jhaant', 'baal',
    'muth', 'muthal', 'hila', 'hilana',
    'chuchi', 'bobbe', 'bobe',
    'bur', 'burr', 'choochi',
    'gandfat', 'gandfad', 'jhaatu',
    'tatti', 'suwar', 'kameena',
    'tharak', 'tharki', 'pataka', 'item', 'maal',
    'hijra', 'hijda', 'chakka', 'meetha',
    'dalla', 'dalle', 'dalal',
    'aand', 'gote', 'gotte',
    'pel', 'pelna', 'thok', 'thokna',
    'chinal', 'gashti',
    'maa', 'behen', 'bhabhi', 'aunty', // Contextual, but often used in slurs
    'bhos', 'bhosda',
    'chud', 'chudai', 'chudwa',
    'gaandu', 'ganduu',
    'laude', 'lode',
    'maderchod', 'madharchod',
    'behenkelode', 'maakelode',
    'teri', 'teri maa', 'teri behen',
    'ullu', 'bewakoof', 'dhakkan',
    'nalayak', 'besharam', 'behaya'
];

// Leetspeak map for normalization
const LEET_MAP: Record<string, string> = {
    '0': 'o',
    '1': 'i',
    '!': 'i',
    '3': 'e',
    '4': 'a',
    '@': 'a',
    '5': 's',
    '$': 's',
    '8': 'b',
    '9': 'g',
    '+': 't',
    '7': 't',
    '(': 'c',
    '|': 'l',
    'z': 's'
};

export const validateNickname = (nickname: string): { valid: boolean; error?: string } => {
    const trimmed = nickname.trim();

    // 1. Basic Length Checks
    if (!trimmed) return { valid: false, error: 'Nickname cannot be empty' };
    if (trimmed.length < 2) return { valid: false, error: 'Nickname must be at least 2 characters' };
    if (trimmed.length > 20) return { valid: false, error: 'Nickname must be 20 characters or less' };

    // 2. Strict Character Check (No special chars allowed for forming words)
    // Allow only alphanumeric and underscores/spaces for display, but strictly validate content
    // User asked: "no should be even able to use ! * or numbers to form the words"
    // We'll allow them in the name but normalize them to check for bad words.

    // 3. Normalization for Profanity Check
    let normalized = trimmed.toLowerCase();

    // Replace leetspeak characters
    for (const [char, replacement] of Object.entries(LEET_MAP)) {
        normalized = normalized.split(char).join(replacement);
    }

    // Remove any remaining non-alphabetic characters to catch things like "b.o.o.b.s"
    const alphaOnly = normalized.replace(/[^a-z]/g, '');

    // 4. Check against Profanity List
    for (const word of PROFANITY_LIST) {
        // Check exact match in normalized string
        if (normalized.includes(word)) {
            return { valid: false, error: '⚠️ Warning: Inappropriate content detected. Continued use of such language will result in a permanent ban and further action.' };
        }
        // Check in alpha-only string (catches "b-o-o-b-s")
        if (alphaOnly.includes(word)) {
            return { valid: false, error: '⚠️ Warning: Inappropriate content detected. Continued use of such language will result in a permanent ban and further action.' };
        }
    }

    // 5. Check for excessive repeated characters (e.g., "aaaaaaa")
    if (/(.)\1{4,}/.test(trimmed)) {
        return { valid: false, error: 'Too many repeated characters' };
    }

    return { valid: true };
};
