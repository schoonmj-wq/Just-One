import { useState } from "react";
import { Btn, Input, Card, Label, useToast, Toast, PlayerDot } from "./UI";
import { PHASES } from "../lib/game";

export default function Lobby({ game, playerId, onStart, onKick }) {
  const { toast, showToast } = useToast();
  const players = Object.entries(game?.players || {}).sort((a, b) => a[1].joinedAt - b[1].joinedAt);
  const isHost = game?.hostId === playerId;
  const me = game?.players?.[playerId];

  const handleStart = () => {
    if (players.length < 2) { showToast("Need at least 2 players!", "error"); return; }
    onStart();
  };

  const roomUrl = `${window.location.origin}?room=${game?.code}`;

  const copyLink = () => {
    navigator.clipboard.writeText(roomUrl).then(() => showToast("Link copied!", "success"));
  };

  const shareLink = () => {
    if (navigator.share) {
      navigator.share({ title: "Just One — join my game!", url: roomUrl });
    } else {
      copyLink();
    }
  };

  return (
    <div style={{ animation: "fadeIn 0.4s ease" }}>
      {/* Room code hero */}
      <Card style={{ textAlign: "center", marginBottom: 20, background: "#ff890608", borderColor: "#ff890625" }}>
        <Label>Room Code</Label>
        <div style={{
          fontFamily: "'Playfair Display', serif", fontSize: "clamp(52px,16vw,80px)",
          fontWeight: 900, letterSpacing: 12, color: "#ff8906", lineHeight: 1,
          marginBottom: 16,
        }}>
          {game?.code}
        </div>
        <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 14, color: "#ffffff60", marginBottom: 16 }}>
          Share this code or link so friends can join from their phones
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <Btn variant="secondary" onClick={copyLink} style={{ fontSize: 13 }}>📋 Copy Link</Btn>
          <Btn variant="secondary" onClick={shareLink} style={{ fontSize: 13 }}>📤 Share</Btn>
        </div>
      </Card>

      {/* Players list */}
      <Card style={{ marginBottom: 20 }}>
        <Label>Players ({players.length}/8)</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {players.map(([pid, p]) => (
            <div key={pid} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <PlayerDot color={p.color} name={p.name} />
                {pid === game?.hostId && (
                  <span style={{ fontFamily: "'Karla', sans-serif", fontSize: 11, color: "#ff890680", background: "#ff890615", borderRadius: 100, padding: "2px 8px" }}>host</span>
                )}
                {pid === playerId && (
                  <span style={{ fontFamily: "'Karla', sans-serif", fontSize: 11, color: "#ffffff40" }}>(you)</span>
                )}
              </div>
              {isHost && pid !== playerId && (
                <Btn variant="danger" onClick={() => onKick(pid)} style={{ fontSize: 11, padding: "4px 10px" }}>Remove</Btn>
              )}
            </div>
          ))}
        </div>

        {players.length < 2 && (
          <div style={{ marginTop: 16, fontFamily: "'Karla', sans-serif", fontSize: 13, color: "#ffffff40", textAlign: "center" }}>
            Waiting for more players to join…
          </div>
        )}
      </Card>

      {isHost && (
        <div style={{ textAlign: "center" }}>
          <Btn onClick={handleStart} style={{ padding: "14px 44px", fontSize: 16 }}>
            Start Game →
          </Btn>
          <p style={{ fontFamily: "'Karla', sans-serif", fontSize: 12, color: "#ffffff35", marginTop: 10 }}>
            Only the host can start the game
          </p>
        </div>
      )}

      {!isHost && (
        <div style={{ textAlign: "center", fontFamily: "'Karla', sans-serif", color: "#ffffff50", fontSize: 14 }}>
          ⏳ Waiting for the host to start…
        </div>
      )}

      <Toast message={toast?.msg} type={toast?.type} />
    </div>
  );
}
