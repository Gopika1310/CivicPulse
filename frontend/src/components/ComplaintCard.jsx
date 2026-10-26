export default function ComplaintCard({ complaint, onResolve, onDelete, canDelete = true, canResolve = true }) {
  const isResolved = complaint.status === 'Resolved';
  const isInProgress = complaint.status === 'In Progress';

  const statusColor = isResolved ? '#48bb78' : isInProgress ? '#4299e1' : '#ed8936';
  const bgColor = isResolved ? '#f0fff4' : isInProgress ? '#ebf8ff' : '#fffaf0';

  return (
    <div style={{
      borderLeft: `4px solid ${statusColor}`,
      background: bgColor,
      padding: '18px',
      borderRadius: '12px',
      marginBottom: '14px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 6px 0', color: '#1a202c' }}>
            {complaint.title}
          </h3>
          <p style={{ fontSize: '14px', color: '#4a5568', margin: '0 0 10px 0', lineHeight: 1.5 }}>
            {complaint.description}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <Tag text={`📍 ${complaint.location}`} />
            <Tag text={`🏷️ ${complaint.category}`} />
            <Tag
              text={`${isResolved ? '✅' : isInProgress ? '🔄' : '⏳'} ${complaint.status}`}
              color={bgColor}
              textColor={statusColor}
              bold
            />
            <Tag text={`👤 ${complaint.reporterName || 'Anonymous'}`} />
            <Tag text={`🕐 ${new Date(complaint.createdAt).toLocaleDateString()}`} />
          </div>
        </div>
      </div>

      {(canResolve || canDelete) && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
          {canResolve && !isResolved && (
            <button
              onClick={() => onResolve(complaint._id)}
              style={{
                background: '#48bb78', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              ✅ Mark Resolved
            </button>
          )}
          {canResolve && !isResolved && complaint.status === 'Pending' && (
            <button
              onClick={() => onResolve && onResolve(complaint._id, 'In Progress')}
              style={{
                background: '#4299e1', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              🔄 In Progress
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(complaint._id)}
              style={{
                background: '#fc8181', color: 'white', border: 'none',
                padding: '8px 16px', borderRadius: '8px',
                fontSize: '13px', fontWeight: 600, cursor: 'pointer'
              }}
            >
              🗑️ Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Tag({ text, color = '#edf2f7', textColor = '#4a5568', bold = false }) {
  return (
    <span style={{
      background: color,
      color: textColor,
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: bold ? 700 : 500
    }}>
      {text}
    </span>
  );
}