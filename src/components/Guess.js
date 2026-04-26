import { useState } from "react";
import { Btn, Input, Card, Label, CluePill, PhaseLabel, useToast, Toast } from "./UI";

export default function Guess({ game, playerId, onSubmitGuess, onSkip }) {
  const [guessInput, setGuessInput] = useState("");
  const { toast, showToast } = useToast();

  const players = Object.entries(game?.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const guesserPid = players[game?.guesserIdx ?? 0]?.[0];
  const guesser = game?.players?.[guesserPid];
  const isGuesser = playerId === guesserPid;

  const revealed = Object.entries(game?.revealedClues || {}).map(([pid, c]) => ({ pid, ...c }));
  const activeClues = revealed.filter(c => !c.eliminated);

  const handleGuess = () => {
    if (!guessInput.trim()) { showToast("Type your guess!", "error"); return; }
    onSubmitGuess(guessInput.trim());
  };

  if (!isGuesser) {
    return (
      <div style={{ animation: "fadeIn 0.4s ease" }}>
        <Card style={{ textAlign: "center", background: "#06b6d410", borderColor: "#06b6d430", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🤔</div>
          <PhaseLabel>Guesser's Turn</PhaseLabel>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>
            {guesser?.name} is thinking…
          </div>
          <p style={{ fontFamily: "'Karla', sans-serif", color: "#ffffff60", fontSize: 14, marginTop: 8 }}>
            No hints! Sit on your hands.
          </p>
        </Card>

        <Card>
          <Label>Clues they can see</Label>
          {activeClues.length === 0 ? (
            <div style={{ fontFamily: "'Karla', sans-serif", color: "#ef4444", textAlign: "center", padding: "12px 0" }}>
              😬 None — all clues were eliminated!
            </div>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {activeClues.map((c, i) => (
                <CluePill key={i} word={c.word} color={c.color} playerName={c.playerName} eliminated={false} />
              ))}
            </div>
          )}
        </Card>
      </div>
    );
  }

  // Is guesser
  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      <Card style={{ textAlign: "center", marginBottom: 20, background: "#06b6d410", borderColor: "#06b6d430" }}>
        <PhaseLabel>Your Clues</PhaseLabel>
        {activeClues.length === 0 ? (
          <div style={{ fontFamily: "'Karla', sans-serif", color: "#ef4444", fontSize: 17, padding: "12px 0" }}>
            😬 All clues were eliminated! You're flying blind.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, justifyContent: "center" }}>
            {activeClues.map((c, i) => (
              <CluePill key={i} word={c.word} color={c.color} playerName={c.playerName} eliminated={false} />
            ))}
          </div>
        )}
      </Card>

      <Card>
        <Label>Your One Guess</Label>
        <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
          <Input
            value={guessInput}
            onChange={setGuessInput}
            onEnter={handleGuess}
            placeholder="What's the secret word?"
            autoFocus
            style={{ fontSize: 18 }}
          />
          <Btn onClick={handleGuess} style={{ whiteSpace: "nowrap", flexShrink: 0 }}>Guess!</Btn>
        </div>
        <div style={{ textAlign: "center" }}>
          <Btn variant="secondary" onClick={onSkip} style={{ fontSize: 13 }}>
            Skip — I have no idea
          </Btn>
        </div>
        <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 12, color: "#ffffff30", marginTop: 12, textAlign: "center" }}>
          You get one guess. Make it count!
        </p>
      </Card>

      <Toast message={toast?.msg} type={toast?.type} />
    </div>
  );
}
