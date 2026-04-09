export default function VoiceButton({ listening, onClick, supported, size = 'normal' }) {
  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      title={listening ? 'Stop listening' : 'Speak'}
      style={{
        width: size === 'small' ? '32px' : '40px',
        height: size === 'small' ? '32px' : '40px',
        borderRadius: '50%',
        border: `2px solid ${listening ? '#C62828' : '#2E7D32'}`,
        background: listening ? '#FFEBEE' : '#E8F5E9',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: size === 'small' ? '14px' : '18px',
        flexShrink: 0,
        animation: listening ? 'pulse 1s infinite' : 'none',
        transition: 'all 0.2s'
      }}
    >
      {listening ? '⏹' : '🎤'}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(198,40,40,0.4); }
          70% { box-shadow: 0 0 0 8px rgba(198,40,40,0); }
          100% { box-shadow: 0 0 0 0 rgba(198,40,40,0); }
        }
      `}</style>
    </button>
  );
}