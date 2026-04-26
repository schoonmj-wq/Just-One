import { useState, useEffect, useCallback } from "react";
import { useGame } from "./lib/useGame";
import { PHASES, normalize } from "./lib/game";
import { Btn, Input, Card, Label, useToast, Toast, PhaseLabel } from "./components/UI";
import Lobby from "./components/Lobby";
import Writing from "./components/Writing";
import Reveal from "./components/Reveal";
import Guess from "./components/Guess";
import Result from "./components/Result";

const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;0,900;1,400&family=Karla:wght@300;400;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { font-size: 16px; }
  body { background: #0b0b1a; color: #fffffe; -webkit-font-smoothing: antialiased; }
  input, button { font-family: inherit; }
  @keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeUp { from { opacity:0; transform:translateX(-50%) translateY(10px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
  input:focus { border-color: #ff8906 !important; }
  input { transition: border-color 0.2s; }
  button:hover:not(:disabled) { filter: brightness(1.08); transform: translateY(-1px); }
  button:active:not(:disabled) { transform: translateY(0); }
  button { transition: all 0.15s; }
  ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #ffffff20; border-radius: 2px; }
`;

function useSession() {
  const key = "just_one_session";
  const get = () => { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } };
  const set = (v) => localStorage.setItem(key, JSON.stringify(v));
  const clear = () => localStorage.removeItem(key);
  return { get, set, clear };
}

export default function App() {
  const session = useSession();
  const { toast, showToast } = useToast();

  // Identity state
  const [roomCode, setRoomCode] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [playerName, setPlayerName] = useState("");
  const [screen, setScreen] = useState("home"); // home | join | loading

  // Form state
  const [nameInput, setNameInput] = useState("");
  const [roomInput, setRoomInput] = useState("");

  const { game, loading, createRoom, joinRoom, startGame, submitClue, revealClues, proceedToGuess, submitGuess, skipGuess, nextRound, kickPlayer, endGame } = useGame(roomCode, playerId, playerName);

  // Restore session on load
  useEffect(() => {
    const saved = session.get();
    if (saved?.roomCode && saved?.playerId && saved?.playerName) {
      setRoomCode(saved.roomCode);
      setPlayerId(saved.playerId);
      setPlayerName(saved.playerName);
    }
    // Check URL for room param
    const params = new URLSearchParams(window.location.search);
    const urlRoom = params.get("room");
    if (urlRoom && !saved) {
      setRoomInput(urlRoom.toUpperCase());
      setScreen("join");
    }
  }, []);

  // If session room is gone from DB, clear it
  useEffect(() => {
    if (roomCode && !loading && game === null) {
      session.clear();
      setRoomCode(null); setPlayerId(null); setPlayerName("");
      setScreen("home");
      showToast("Room ended or not found", "error");
    }
  }, [game, loading, roomCode]);

  // Save session whenever identity changes
  useEffect(() => {
    if (roomCode && playerId && playerName) {
      session.set({ roomCode, playerId, playerName });
    }
  }, [roomCode, playerId, playerName]);

  // Expose submitClue globally so Writing component can call it
  useEffect(() => {
    window.__submitClue = (word) => submitClue(word);
    return () => { delete window.__submitClue; };
  }, [submitClue]);

  // Auto-reveal when all clue givers have submitted
  useEffect(() => {
    if (!game || game.phase !== PHASES.WRITING) return;
    if (game.hostId !== playerId) return; // only host does this
    const players = Object.entries(game.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
    const guesserPid = players[game.guesserIdx ?? 0]?.[0];
    const clueGiverPids = players.filter(([pid]) => pid !== guesserPid).map(([pid]) => pid);
    const submittedPids = Object.keys(game.clues || {});
    const allDone = clueGiverPids.length > 0 && clueGiverPids.every(pid => submittedPids.includes(pid));
    if (allDone) {
      setTimeout(() => revealClues(), 800); // small delay for UX
    }
  }, [game, playerId]);

  const handleCreate = async () => {
    const name = nameInput.trim();
    if (!name) { showToast("Enter your name!", "error"); return; }
    setScreen("loading");
    try {
      const { code, playerId: pid } = await createRoom(name);
      setRoomCode(code); setPlayerId(pid); setPlayerName(name);
      window.history.replaceState({}, "", `?room=${code}`);
    } catch (e) {
      showToast(e.message || "Failed to create room", "error");
      setScreen("home");
    }
  };

  const handleJoin = async () => {
    const name = nameInput.trim();
    const code = roomInput.trim().toUpperCase();
    if (!name) { showToast("Enter your name!", "error"); return; }
    if (code.length !== 4) { showToast("Enter a 4-letter room code", "error"); return; }
    setScreen("loading");
    try {
      const { code: c, playerId: pid } = await joinRoom(code, name);
      setRoomCode(c); setPlayerId(pid); setPlayerName(name);
      window.history.replaceState({}, "", `?room=${c}`);
    } catch (e) {
      showToast(e.message || "Failed to join room", "error");
      setScreen("join");
    }
  };

  const handleEnd = async () => {
    await endGame();
    session.clear();
    setRoomCode(null); setPlayerId(null); setPlayerName("");
    setScreen("home");
    window.history.replaceState({}, "", window.location.pathname);
  };

  const handleLeave = () => {
    session.clear();
    setRoomCode(null); setPlayerId(null); setPlayerName("");
    setScreen("home");
    window.history.replaceState({}, "", window.location.pathname);
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  const Header = ({ showLeave = true }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
      <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, letterSpacing: 0.5 }}>
        Just <span style={{ color: "#ff8906" }}>One</span>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        {game && (
          <>
            <span style={{ fontFamily: "'Karla', sans-serif", fontSize: 13, color: "#ffffff60" }}>
              R<strong style={{ color: "#fffffe" }}>{game.round || "—"}</strong>
              &nbsp;·&nbsp;
              <strong style={{ color: "#ff8906" }}>{game.score || 0}</strong> pts
            </span>
            <span style={{ fontFamily: "'Karla', sans-serif", fontSize: 12, color: "#ff890680", background: "#ff890612", borderRadius: 100, padding: "3px 10px", border: "1px solid #ff890625" }}>
              {game.code}
            </span>
          </>
        )}
        {showLeave && (
          <Btn variant="ghost" onClick={handleLeave} style={{ fontSize: 12, padding: "6px 12px" }}>Leave</Btn>
        )}
      </div>
    </div>
  );

  // ── Screens ───────────────────────────────────────────────────────────────

  if (screen === "loading" || (roomCode && loading)) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0b0b1a" }}>
        <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: "#ff8906", animation: "pulse 1.4s infinite" }}>
          Just One…
        </div>
      </div>
    );
  }

  // In a room — show game
  if (roomCode && game && playerId) {
    // Check player still in game
	if (!game.players?.[playerId]) {
  	return null;
    }

    return (
      <div style={{ minHeight: "100vh", background: "#0b0b1a" }}>
        <style>{GLOBAL_STYLES}</style>
        <div style={{ maxWidth: 540, margin: "0 auto", padding: "20px 16px 80px" }}>
          <Header />
          {game.phase === PHASES.LOBBY && (
            <Lobby game={game} playerId={playerId} onStart={startGame} onKick={kickPlayer} />
          )}
          {game.phase === PHASES.WRITING && (
            <Writing game={game} playerId={playerId} />
          )}
          {game.phase === PHASES.REVEAL && (
            <Reveal game={game} playerId={playerId} onProceed={proceedToGuess} />
          )}
          {game.phase === PHASES.GUESS && (
            <Guess game={game} playerId={playerId} onSubmitGuess={submitGuess} onSkip={skipGuess} />
          )}
          {game.phase === PHASES.RESULT && (
            <Result game={game} playerId={playerId} onNext={nextRound} onEnd={handleEnd} />
          )}
        </div>
        <Toast message={toast?.msg} type={toast?.type} />
      </div>
    );
  }

  // Home / Join screens
  return (
    <div style={{ minHeight: "100vh", background: "#0b0b1a", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <style>{GLOBAL_STYLES}</style>

      <div style={{ width: "100%", maxWidth: 420, animation: "fadeIn 0.5s ease" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "clamp(56px, 16vw, 88px)",
            fontWeight: 900, lineHeight: 1, letterSpacing: -1,
          }}>
            Just <span style={{ color: "#ff8906" }}>One</span>
          </div>
          <p style={{ fontFamily: "'Karla', sans-serif", color: "#ffffff50", fontSize: 15, marginTop: 10 }}>
            The cooperative one-word guessing game
          </p>
        </div>

        {/* Name field — always shown */}
        <Card style={{ marginBottom: 16 }}>
          <Label>Your Name</Label>
          <Input
            value={nameInput}
            onChange={setNameInput}
            placeholder="Enter your name…"
            autoFocus
            onEnter={screen === "join" ? handleJoin : handleCreate}
          />
        </Card>

        {screen === "join" && (
          <Card style={{ marginBottom: 16 }}>
            <Label>Room Code</Label>
            <Input
              value={roomInput}
              onChange={v => setRoomInput(v.toUpperCase())}
              placeholder="4-letter code (e.g. KZMQ)"
              onEnter={handleJoin}
              style={{ letterSpacing: 4, fontSize: 20, fontFamily: "'Playfair Display', serif", fontWeight: 700 }}
            />
          </Card>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {screen === "home" && (
            <>
              <Btn onClick={handleCreate} style={{ width: "100%", padding: "14px", fontSize: 16 }}>
                Create Room
              </Btn>
              <Btn variant="secondary" onClick={() => setScreen("join")} style={{ width: "100%", padding: "13px", fontSize: 15 }}>
                Join with Code
              </Btn>
            </>
          )}
          {screen === "join" && (
            <>
              <Btn onClick={handleJoin} style={{ width: "100%", padding: "14px", fontSize: 16 }}>
                Join Room →
              </Btn>
              <Btn variant="ghost" onClick={() => setScreen("home")} style={{ width: "100%", textAlign: "center" }}>
                ← Back
              </Btn>
            </>
          )}
        </div>

        {/* How to play */}
        <div style={{ marginTop: 36, fontFamily: "'Karla', sans-serif", fontSize: 13, color: "#ffffff35", lineHeight: 1.8, textAlign: "center" }}>
          Everyone writes one clue · Duplicates cancel · Guesser gets one shot
        </div>
      </div>

      <Toast message={toast?.msg} type={toast?.type} />
    </div>
  );
}
