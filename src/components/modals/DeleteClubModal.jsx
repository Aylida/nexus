export default function DeleteClubModal({ club, onConfirm, onCancel }) {
  if (!club) return null;
  return (
    <div className="modal-overlay open" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal">
        <div className="modal-title">Topluluğu sil</div>
        <div style={{ fontSize: 12, color: 'var(--ink2)', marginBottom: 18 }}>
          <span style={{ fontWeight: 500 }}>{club.name}</span> silinecek. Emin misiniz?
        </div>
        <div className="modal-btns">
          <button className="mbtn" onClick={onCancel}>İptal</button>
          <button className="mbtn danger" onClick={() => onConfirm(club.id)}>Sil</button>
        </div>
      </div>
    </div>
  );
}
