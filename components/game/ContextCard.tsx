type ContextCardProps = {
  parasha: string;
  topic_category: string;
  context: string;
};

export default function ContextCard({ parasha, topic_category, context }: ContextCardProps) {
  return (
    <div
      style={{
        width: "100%",
        background: "var(--navy)",
        borderRadius: "var(--radius)",
        padding: "18px 20px",
      }}
    >
      <div
        style={{
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: "2px",
          color: "var(--gold-pale)",
          opacity: 0.8,
          marginBottom: 4,
        }}
      >
        {topic_category} · Today&apos;s Topic
      </div>
      <div
        style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 20,
          fontWeight: 700,
          color: "var(--gold)",
          marginBottom: 8,
        }}
      >
        {parasha}
      </div>
      <div
        style={{
          fontSize: 13,
          lineHeight: 1.7,
          color: "rgba(255, 255, 255, 0.82)",
          fontStyle: "italic",
        }}
      >
        {context}
      </div>
    </div>
  );
}
