import { Btn, Card, Label, CluePill, PhaseLabel } from "./UI";

export default function Result({ game, playerId, onNext, onEnd }) {
  const isHost = game?.hostId === playerId;
  const players = Object.entries(game?.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const guesserPid = players[game?.guesserIdx ?? 0]?.[0];
  const guesser = game?.players?.[guesserPid];

  const result = game?.guessResult;
  const correct = result === "correct";
  const skipped = result === "skip";

  const allClues = Object.entries(game?.revealedClues || {}).map(([pid, c]) => ({ pid, ...c }));
  const nextGuesserName = players[((game?.guesserIdx ?? 0) + 1) % players.length]?.[1]?.name;

  const resultColor = correct ? "#22c55e" : "#ef4444";
  const emoji = correct ? "🎉" : skipped ? "⏭️" : "😅";

  return (
    <div style={{ animation: "fadeIn 0.4s ease", textAlign: "center" }}>
      {/* Result hero */}
      <Card style={{ marginBottom: 20, background: correct ? "#22c55e10" : "#ef444410", borderColor: correct ? "#22c55e40" : "#ef444440" }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>{emoji}</div>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: 30, fontWeight: 900,
          color: resultColor, marginBottom: 8,
        }}>
          {correct ? "Correct!" : skipped ? "Skipped" : "Not quite!"}
        </div>

        {!correct && (
          <div style={{ fontFamily: "'Karla', sans-serif", fontSize: 18, color: "#fffffe80", marginBottom: 4 }}>
            The word was <strong style={{ color: "#ff8906" }}>{game?.secretWord}</strong>
          </div>
        )}
        {!correct && !skipped && game?.guess && (
          <div style={{ fontFamily: "'Karla', sans-serif", fontSize: 14, color: "#ffffff50" }}>
            {guesser?.name} guessed: <strong style={{ color: "#ffffff80" }}>"{game.guess}"</strong>
          </div>
        )}

        <div style={{ marginTop: 16, fontFamily: "'Karla', sans-serif", fontSize: 22, fontWeight: 700, color: "#ff8906" }}>
          {game?.score} point{game?.score !== 1 ? "s" : ""} so far
        </div>
        <div style={{ fontFamily: "'Karla', sans-serif", fontSize: 13, color: "#ffffff40" }}>
          in {game?.round} round{game?.round !== 1 ? "s" : ""}
        </div>
      </Card>

      {/* All clues recap */}
      {allClues.length > 0 && (
        <Card style={{ marginBottom: 20, textAlign: "left" }}>
          <Label>All clues this round</Label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {allClues.map((c, i) => (
              <CluePill key={i} word={c.word} color={c.color} playerName={c.playerName} eliminated={c.eliminated} />
            ))}
          </div>
        </Card>
      )}

      {/* Next guesser */}
      <div style={{ fontFamily: "'Karla', sans-serif", fontSize: 14, color: "#ffffff50", marginBottom: 20 }}>
        Next guesser: <strong style={{ color: "#fffffe" }}>{nextGuesserName}</strong>
      </div>

      {isHost ? (
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn onClick={onNext} style={{ padding: "13px 36px" }}>Next Round →</Btn>
          <Btn variant="danger" onClick={onEnd}>End Game</Btn>
        </div>
      ) : (
        <div style={{ fontFamily: "'Karla', sans-serif", color: "#ffffff50", fontSize: 14 }}>
          ⏳ Waiting for host to start next round…
        </div>
      )}
    </div>
  );
}
