export function Toast({ text, onClose }: { text: string; onClose: () => void }) {
  return (
    <div
      style={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        padding: 12,
        border: '1px solid #ddd',
        background: 'white',
        borderRadius: 10,
        boxShadow: '0 6px 18px rgba(0,0,0,0.15)',
        maxWidth: 360,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontWeight: 600 }}>{text}</div>
        <button onClick={onClose} style={{ cursor: 'pointer' }}>
          ✕
        </button>
      </div>
    </div>
  );
}
