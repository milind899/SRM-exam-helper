// Comprehensive profanity list (100+ words) - case-insensitive
const PROFANITY_LIST = [
    // Reserved/Protected
    'milind',

    // English profanity (common)
    'fuck', 'fuk', 'fck', 'f*ck', 'fucker', 'fucking', 'motherfucker', 'mf',
    'shit', 'sh1t', 'shit', 'bullshit', 'bullsh1t',
    'bitch', 'b1tch', 'bitches', 'biatch',
    'ass', 'a$$', 'asshole', 'arse', 'arsehole',
    'bastard', 'bast ard',
    'damn', 'dammit', 'damnn',
    'hell', 'heck',
    'crap', 'crappy',

    // Sexual/explicit
    'dick', 'cock', 'penis', 'pussy', 'vagina', 'cunt', 'c*nt',
    'whore', 'slut', 'prostitute', 'hooker',
    'sex', 'sexy', 'porn', 'porno', 'xxx', 'nude', 'naked', 'boobs', 'tits',
    'rape', 'rapist', 'molest',

    // Slurs and offensive terms
    'nigger', 'nigga', 'n1gger', 'n1gga',
    'fag', 'faggot', 'f@g', 'f@ggot',
    'retard', 'retarded', 'r3tard',
    'gay', 'lesbian', // when used pejoratively
    'tranny', 'trannie',
    'chink', 'gook', 'spic', 'wetback',

    // Violence/threats
    'kill', 'killer', 'murder', 'murderer', 'die', 'death', 'dead',
    'terrorist', 'terrorism', 'bomb', 'bombing', 'shoot', 'gun', 'weapon',
    'hitler', 'nazi', 'genocide',

    // Spam/impersonation
    'admin', 'moderator', 'mod', 'official', 'support', 'verified', 'staff',
    'owner', 'developer', 'dev',

    // Hindi/Indian profanity (romanized)
    'chutiya', 'chutiye', 'chut', 'chod', 'chodu',
    'madarchod', 'maderchod', 'mc', 'madharchod',
    'bhenchod', 'bc', 'behen chod', 'benchod',
    'bhadwa', 'bhadwe', 'bhadva', 'bhosad', 'bhosdi', 'bhosadike',
    'lund', 'loda', 'lauda', 'land',
    'gandu', 'gand', 'gaand', 'gandfat', 'gandfad',
    'randi', 'rand', 'randwa', 'kutti', 'kutta', 'kute',
    'harami', 'haramzada', 'haraamzada', 'haramkhor',
    'kamina', 'kamine', 'kamini',
    'saala', 'sala', 'saale', 'saali',
    'bakchod', 'bakchodi', 'bakland',
    'jhaat', 'jhaant', 'baal',
    'teri maa', 'teri ma', 'maa ki',
    'baap', 'behen', 'behan',
    'chinal', 'chinaal',
    'raand', 'raandi',
    'hutiya',

    // Variations and leetspeak
    'fvck', 'phuck', 'f u c k', 'f.u.c.k',
    'sh!t', 'sh@t', '$hit',
    'b!tch', 'b@tch', 'bi+ch',
    'a$$h0le', '@sshole',
    'p0rn', 'pr0n',
    'n00b', 'noob', // gaming insults
    'scrub', 'trash', 'garbage', // when used as insults

    // Drug references
    'weed', 'marijuana', 'cocaine', 'coke', 'heroin', 'meth',
    'drug', 'drugs', 'druggie',

    // Additional offensive
    'piss', 'pissed', 'douche', 'douchebag',
    'idiot', 'moron', 'stupid', 'dumb', 'dumbass',
    'loser', 'suck', 'sucks', 'sucked',
    'ugly', 'fat', 'skinny', // body shaming
    'cancer', 'aids', // disease as insult

    // More Indian/regional
    'chutiyapa', 'chutiyap',
    'bhosadiwala', 'bhosadiwale',
    'lavda', 'lawda', 'loda',
    'maa chod', 'ma chod',
    'teri bhen', 'teri behan',
    'chodu', 'chomu',
    'bakrichodd', 'bakrichod',
    'kutte', 'kaminey',
    'ullu', 'bevakoof', 'bewakoof',
    'gashti', 'rundi',
    'bhikari', 'bhikhari',
    'dalle', 'dalli',
    'hijda', 'hijra',
    'tharak', 'tharki',
    'pataka', 'item', // objectifying
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

    // Remove spaces and special characters for more thorough checking
    const cleanedNickname = lowerNickname.replace(/[\s._-]/g, '');

    for (const word of PROFANITY_LIST) {
        // Check original
        if (lowerNickname.includes(word)) {
            return { valid: false, error: 'This nickname contains inappropriate content' };
        }
        // Check cleaned version (catches variations like "b.a.d.w.o.r.d")
        if (cleanedNickname.includes(word.replace(/[\s._-]/g, ''))) {
            return { valid: false, error: 'This nickname contains inappropriate content' };
        }
    }

    // Check for excessive numbers or special characters
    const specialCharCount = (trimmed.match(/[^a-zA-Z0-9]/g) || []).length;
    if (specialCharCount > 3) {
        return { valid: false, error: 'Too many special characters' };
    }

    // Check for too many repeated characters (e.g., "aaaaaaa")
    if (/(.)\1{4,}/.test(trimmed)) {
        return { valid: false, error: 'Too many repeated characters' };
    }

    return { valid: true };
};
