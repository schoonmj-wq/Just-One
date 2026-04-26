import { useEffect, useState, useCallback } from "react";
import { ref, onValue, set, update, get } from "firebase/database";
import { db } from "./firebase";
import { getRandomWord, findDuplicates, generateRoomCode, PLAYER_COLORS, PHASES } from "./game";

export function useGame(roomCode, playerId, playerName) {
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);

  // Subscribe to game state
useEffect(() => {
  if (!roomCode) return;
  const r = ref(db, `rooms/${roomCode}`);
  const unsub = onValue(r, snap => {
    setGame(snap.val());
    setLoading(false);
  });
  return () => unsub();
}, [roomCode]);

  // ── Actions ──────────────────────────────────────────────────────────────

  const createRoom = useCallback(async (hostName) => {
    const code = generateRoomCode();
    const hid = `p_${Date.now()}`;
    const initialState = {
      code,
      phase: PHASES.LOBBY,
      hostId: hid,
      round: 0,
      score: 0,
      guesserIdx: 0,
      secretWord: "",
      clues: {},
      revealedClues: null,
      guessResult: null,
      guess: "",
      players: {
        [hid]: { name: hostName, color: PLAYER_COLORS[0], joinedAt: Date.now() }
      },
      createdAt: Date.now(),
    };
    await set(ref(db, `rooms/${code}`), initialState);
    return { code, playerId: hid };
  }, []);

  const joinRoom = useCallback(async (code, name) => {
    const snap = await get(ref(db, `rooms/${code}`));
    if (!snap.exists()) throw new Error("Room not found");
    const gameData = snap.val();
    if (gameData.phase !== PHASES.LOBBY) throw new Error("Game already started");
    const existing = Object.values(gameData.players || {});
    if (existing.length >= 8) throw new Error("Room is full (max 8 players)");
    if (existing.find(p => p.name.toLowerCase() === name.toLowerCase())) throw new Error("Name already taken");

    const pid = `p_${Date.now()}`;
    const colorIdx = Object.keys(gameData.players || {}).length % PLAYER_COLORS.length;
    await update(ref(db, `rooms/${code}/players`), {
      [pid]: { name, color: PLAYER_COLORS[colorIdx], joinedAt: Date.now() }
    });
    return { code, playerId: pid };
  }, []);

  const startGame = useCallback(async () => {
    await update(roomRef, {
      phase: PHASES.WRITING,
      round: 1,
      score: 0,
      guesserIdx: 0,
      secretWord: getRandomWord(),
      clues: {},
      revealedClues: null,
      guessResult: null,
      guess: "",
    });
  }, [roomRef]);

  const submitClue = useCallback(async (word) => {
    await update(ref(db, `rooms/${roomCode}/clues`), {
      [playerId]: { word, playerName, color: game?.players?.[playerId]?.color, submittedAt: Date.now() }
    });
  }, [roomCode, playerId, playerName, game]);

  const revealClues = useCallback(async () => {
    const processed = findDuplicates(game?.clues || {});
    await update(roomRef, {
      phase: PHASES.REVEAL,
      revealedClues: processed,
    });
  }, [roomRef, game]);

  const proceedToGuess = useCallback(async () => {
    await update(roomRef, { phase: PHASES.GUESS });
  }, [roomRef]);

  const submitGuess = useCallback(async (guessWord) => {
    const correct = guessWord.trim().toLowerCase().replace(/[^a-z]/g, "") ===
      game?.secretWord?.toLowerCase();
    await update(roomRef, {
      phase: PHASES.RESULT,
      guess: guessWord,
      guessResult: correct ? "correct" : "wrong",
      score: (game?.score || 0) + (correct ? 1 : 0),
    });
  }, [roomRef, game]);

  const skipGuess = useCallback(async () => {
    await update(roomRef, {
      phase: PHASES.RESULT,
      guess: "",
      guessResult: "skip",
    });
  }, [roomRef]);

  const nextRound = useCallback(async () => {
    const playerCount = Object.keys(game?.players || {}).length;
    const nextIdx = ((game?.guesserIdx || 0) + 1) % playerCount;
    await update(roomRef, {
      phase: PHASES.WRITING,
      round: (game?.round || 0) + 1,
      guesserIdx: nextIdx,
      secretWord: getRandomWord(),
      clues: {},
      revealedClues: null,
      guessResult: null,
      guess: "",
    });
  }, [roomRef, game]);

  const kickPlayer = useCallback(async (pid) => {
    const updates = {};
    updates[`players/${pid}`] = null;
    await update(roomRef, updates);
  }, [roomRef]);

  const endGame = useCallback(async () => {
    await set(roomRef, null);
  }, [roomRef]);

  return {
    game, loading,
    createRoom, joinRoom,
    startGame, submitClue, revealClues, proceedToGuess,
    submitGuess, skipGuess, nextRound, kickPlayer, endGame,
  };
}
