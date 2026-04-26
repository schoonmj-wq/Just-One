export const WORD_BANK = [
  "PIANO","ROCKET","JUNGLE","DIAMOND","VOLCANO","PENGUIN","CASTLE","TORNADO",
  "CHOCOLATE","LIBRARY","GLACIER","COMPASS","LANTERN","TELESCOPE","KITE",
  "ANCHOR","FOSSIL","CATHEDRAL","HAMMOCK","LABYRINTH","FIREFLY","SYMPHONY",
  "ARCHIPELAGO","SPHINX","ACCORDION","CHIMNEY","PRISM","SUNDIAL","TUNDRA",
  "VELVET","MONSOON","KALEIDOSCOPE","BLOSSOM","SAFARI","MIRAGE","COBALT",
  "ECLIPSE","FEATHER","GEYSER","HARPOON","IGLOO","JAVELIN","KINGDOM","LAVA",
  "METEOR","NECTAR","OASIS","PHANTOM","QUARTZ","RIDDLE","SAPPHIRE","THUNDER",
  "UMBRELLA","VORTEX","WALRUS","XYLOPHONE","YETI","ZENITH","AMBER","BANJO",
  "CANYON","DAGGER","EMBER","FALCON","GOBLIN","HARBOR","IVORY","JAGUAR",
  "KELP","LAGOON","MANGO","NOMAD","ORBIT","PEBBLE","QUILL","RAVEN","SIREN",
  "TALON","UNICORN","VENOM","WHIRLPOOL","FERN","HONEY","IRON","JADE","KNOT",
  "LEMON","MARBLE","NEON","OPTIC","PLUME","RUST","STONE","TIDE","URCHIN",
  "VAPOR","WAVE","YARN","ZINC","BRONZE","CORAL","DUNE","SUMMIT","FLUTE",
  "GROTTO","HAVEN","INLET","JINX","KAYAK","LLAMA","MURAL","NADIR","OWLET",
  "PARKA","QUOTA","ROBIN","SCONE","TROUT","ULCER","VIVID","WIDOW","EXPO"
];

export const PLAYER_COLORS = [
  "#f97316","#06b6d4","#a855f7","#22c55e",
  "#ec4899","#eab308","#3b82f6","#ef4444"
];

export const PHASES = {
  LOBBY: "lobby",
  WRITING: "writing",
  REVEAL: "reveal",
  GUESS: "guess",
  RESULT: "result",
};

export function getRandomWord() {
  return WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)];
}

export function normalize(w = "") {
  return w.trim().toLowerCase().replace(/[^a-z]/g, "");
}

export function findDuplicates(cluesObj = {}) {
  const clues = Object.entries(cluesObj).map(([pid, data]) => ({ pid, ...data }));
  const counts = {};
  clues.forEach(c => {
    const n = normalize(c.word);
    counts[n] = (counts[n] || 0) + 1;
  });
  const result = {};
  clues.forEach(c => {
    const n = normalize(c.word);
    result[c.pid] = { ...c, eliminated: counts[n] > 1 || n === "" };
  });
  return result;
}

export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function checkClueWithAI(secretWord, clueWord) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: `In the party game "Just One", a clue is INVALID if it: (1) is the same word or simple variation/plural/conjugation of the secret word, (2) contains the secret word as part of it, or (3) is not a real English word.

Secret word: "${secretWord}"
Clue given: "${clueWord}"

Reply ONLY with valid JSON, no markdown: {"valid": true/false, "reason": "brief reason"}`
        }]
      })
    });
    const data = await res.json();
    const text = data.content?.[0]?.text || '{"valid":true,"reason":""}';
    return JSON.parse(text.replace(/```json|```/g, "").trim());
  } catch {
    return { valid: true, reason: "" };
  }
}
