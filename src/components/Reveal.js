import { Btn, Card, Label, CluePill, PhaseLabel } from "./UI";

export default function Reveal({ game, playerId, onProceed }) {
  const players = Object.entries(game?.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const guesserPid = players[game?.guesserIdx ?? 0]?.[0];
  const guesser = game?.players?.[guesserPid];
  const isHost = game?.hostId === playerId;
  const isGuesser = playerId === guesserPid;

  const revealed = Object.entries(game?.revealedClues || {}).map(([pid, c]) => ({ pid, ...c }));
  const active = revealed.filter(c => !c.eliminated);
  const eliminated = revealed.filter(c => c.eliminated);

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {isGuesser ? (
        <Card style={{ textAlign: "center", background: "#a855f710", borderColor: "#a855f730", marginBottom: 20 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🙈</div>
          <div style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 700 }}>
            Still looking away, {guesser?.name}!
          </div>
          <p style={{ fontFamily: "'Karla', sans-serif", color: "#ffffff60", fontSize: 14, marginTop: 8 }}>
            The host is reviewing clues before your turn.
          </p>
        </Card>
      ) : (
        <>
          <Card style={{ marginBottom: 20, background: "#ff890608", borderColor: "#ff890625" }}>
            <PhaseLabel>Clue Review — Don't let {guesser?.name} see!</PhaseLabel>

            {active.length > 0 && (
              <>
                <Label>✅ Surviving Clues ({active.length})</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
                  {active.map((c, i) => (
                    <CluePill key={i} word={c.word} color={c.color} playerName={c.playerName} eliminated={false} />
                  ))}
                </div>
              </>
            )}

            {eliminated.length > 0 && (
              <>
                <Label>❌ Eliminated ({eliminated.length} duplicate{eliminated.length > 1 ? "s" : ""})</Label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {eliminated.map((c, i) => (
                    <CluePill key={i} word={c.word} color={c.color} playerName={c.playerName} eliminated={true} />
                  ))}
                </div>
              </>
            )}

            {active.length === 0 && (
              <div style={{ fontFamily: "'Karla', sans-serif", color: "#ef4444", textAlign: "center", padding: "16px 0", fontSize: 15 }}>
                😬 All clues eliminated! Guesser flies blind.
              </div>
            )}
          </Card>

          {isHost ? (
            <div style={{ textAlign: "center" }}>
              <Btn onClick={onProceed} style={{ padding: "13px 36px" }}>
                {guesser?.name}, it's your turn →
              </Btn>
              <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 12, color: "#ffffff35", marginTop: 10 }}>
                Only you can see eliminated clues. Press when ready.
              </p>
            </div>
          ) : (
            <div style={{ textAlign: "center", fontFamily: "'Karla', sans-serif", color: "#ffffff50", fontSize: 14 }}>
              ⏳ Waiting for host to proceed…
            </div>
          )}
        </>
      )}
    </div>
  );
}
