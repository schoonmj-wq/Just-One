import { useState } from "react";
import { Btn, Input, Card, Label, useToast, Toast, PlayerDot, PhaseLabel } from "./UI";
import { checkClueWithAI, normalize, PHASES } from "../lib/game";

export default function Writing({ game, playerId }) {
  const [clueInput, setClueInput] = useState("");
  const [validating, setValidating] = useState(false);
  const { toast, showToast } = useToast();

  const players = Object.entries(game?.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const guesserEntry = players[game?.guesserIdx ?? 0];
  const guesserPid = guesserEntry?.[0];
  const guesser = guesserEntry?.[1];
  const isGuesser = playerId === guesserPid;
  const me = game?.players?.[playerId];

  const submittedPids = Object.keys(game?.clues || {});
  const hasSubmitted = submittedPids.includes(playerId);

  const clueGiverPids = players.filter(([pid]) => pid !== guesserPid).map(([pid]) => pid);
  const waitingOn = clueGiverPids.filter(pid => !submittedPids.includes(pid))
    .map(pid => game.players[pid]?.name).filter(Boolean);

  const handleSubmit = async () => {
    const word = clueInput.trim();
    if (!word) { showToast("Enter a clue first!", "error"); return; }
    if (word.includes(" ")) { showToast("One word only!", "error"); return; }
    setValidating(true);
    const check = await checkClueWithAI(game.secretWord, word);
    setValidating(false);
    if (!check.valid) {
      showToast(`❌ Invalid: ${check.reason}`, "error", 3500);
      return;
    }
    // Write to Firebase via parent (we pass onSubmit from App)
    window.__submitClue?.(word);
    showToast("Clue submitted! ✓", "success");
    setClueInput("");
  };

  if (isGuesser) {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <Card style={{ textAlign: "center", background: "#06b6d410", borderColor: "#06b6d430" }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🙈</div>
          <PhaseLabel>You're the Guesser!</PhaseLabel>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            Look away while others write their clues
          </div>
          <p style={{ fontFamily: "'Karla', sans-serif", color: "#ffffff60", fontSize: 14 }}>
            You'll be called when everyone's ready.
          </p>
        </Card>

        <Card style={{ marginTop: 20 }}>
          <Label>Status</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {clueGiverPids.map(pid => {
              const done = submittedPids.includes(pid);
              const p = game.players[pid];
              return (
                <div key={pid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <PlayerDot color={p?.color} name={p?.name} />
                  <span style={{ fontFamily: "'Karla', sans-serif", fontSize: 13, color: done ? "#22c55e" : "#ffffff40" }}>
                    {done ? "✓ Done" : "writing…"}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>
        <Toast message={toast?.msg} type={toast?.type} />
      </div>
    );
  }

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Secret word */}
      <Card style={{ textAlign: "center", marginBottom: 20, background: "#ff890610", borderColor: "#ff890630" }}>
        <PhaseLabel>Secret Word — Don't tell {guesser?.name}!</PhaseLabel>
        <div style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: "clamp(36px, 10vw, 64px)",
          fontWeight: 900, letterSpacing: 4, color: "#ff8906",
          textTransform: "uppercase",
        }}>
          {game.secretWord}
        </div>
      </Card>

      {/* Clue input */}
      <Card style={{ marginBottom: 20 }}>
        <Label>Your Clue</Label>
        {hasSubmitted ? (
          <div style={{ textAlign: "center", padding: "16px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
            <div style={{ fontFamily: "'Karla', sans-serif", color: "#22c55e", fontSize: 16, fontWeight: 600 }}>
              Clue submitted!
            </div>
            <div style={{ fontFamily: "'Karla', sans-serif", color: "#ffffff40", fontSize: 13, marginTop: 6 }}>
              Your clue: <strong style={{ color: "#ffffff80" }}>{game.clues[playerId]?.word}</strong>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <Input
                value={clueInput}
                onChange={setClueInput}
                onEnter={!validating ? handleSubmit : undefined}
                placeholder="One word clue…"
                autoFocus
                disabled={validating}
              />
              <Btn onClick={handleSubmit} disabled={validating} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>
                {validating ? "Checking…" : "Submit"}
              </Btn>
            </div>
            <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 12, color: "#ffffff35", marginTop: 8 }}>
              One word only. AI will check it's valid. Duplicates cancel each other out!
            </p>
          </>
        )}
      </Card>

      {/* Others' status */}
      <Card>
        <Label>Everyone's Status</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {clueGiverPids.map(pid => {
            const done = submittedPids.includes(pid);
            const p = game.players[pid];
            return (
              <div key={pid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <PlayerDot color={p?.color} name={p?.name} />
                <span style={{ fontFamily: "'Karla', sans-serif", fontSize: 13, color: done ? "#22c55e" : "#ffffff40" }}>
                  {done ? "✓ Done" : "writing…"}
                </span>
              </div>
            );
          })}
        </div>
        {waitingOn.length === 0 ? (
          <div style={{ marginTop: 14, fontFamily: "'Karla', sans-serif", fontSize: 13, color: "#22c55e", textAlign: "center" }}>
            Everyone's in — host will reveal clues shortly…
          </div>
        ) : null}
      </Card>

      <Toast message={toast?.msg} type={toast?.type} />
    </div>
  );
}
