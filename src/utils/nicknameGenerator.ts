export const generateNickname = (): string => {
    const adjectives = [
        "Happy", "Clever", "Brave", "Swift", "Calm", "Eager", "Bright", "Lucky",
        "Wise", "Bold", "Sharp", "Quick", "Cool", "Kind", "Fresh", "Super"
    ];
    const nouns = [
        "Panda", "Tiger", "Eagle", "Fox", "Owl", "Lion", "Wolf", "Bear",
        "Hawk", "Falcon", "Coder", "Geek", "Star", "Moon", "Sun", "Sky"
    ];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 100);

    return `${adj}${noun}${num}`;
};
