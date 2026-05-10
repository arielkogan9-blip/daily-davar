import { Attempt } from "@/lib/types";

type AttemptDotsProps = {
  attempts: Attempt[];
  maxAttempts: number;
  gameOver: boolean;
};

export default function AttemptDots({ attempts, maxAttempts, gameOver }: AttemptDotsProps) {
  return (
    <div style={{ display: "flex", flexDirection: "row", gap: 8, alignItems: "center" }}>
      {Array.from({ length: maxAttempts }).map((_, i) => {
        const att = attempts[i];
        const isNext = i === attempts.length && !gameOver;

        let bg = "transparent";
        let borderColor = "var(--border)";
        let color = "transparent";
        let content: string = "";

        if (att) {
          if (att.correct) {
            bg = "var(--correct)";
            borderColor = "var(--correct)";
            color = "#fff";
            content = "✓";
          } else {
            bg = "var(--wrong)";
            borderColor = "var(--wrong)";
            color = "#fff";
            content = "✗";
          }
        } else if (isNext) {
          borderColor = "var(--navy)";
          color = "var(--navy)";
          content = String(i + 1);
        }

        return (
          <div
            key={i}
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              border: `1.5px solid ${borderColor}`,
              background: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 13,
              color,
              transition: "all 0.2s",
            }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
}
