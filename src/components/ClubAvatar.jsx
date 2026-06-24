export default function ClubAvatar({ club, photos, size = 28, radius = 3 }) {
  const photo = photos[club.id];
  const s = size + 'px';
  if (photo) {
    return (
      <div
        style={{
          width: s,
          height: s,
          borderRadius: radius,
          overflow: 'hidden',
          flexShrink: 0,
          background: 'var(--bg2)',
        }}
      >
        <img
          src={photo}
          loading="lazy"
          decoding="async"
          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          alt={club.short}
        />
      </div>
    );
  }
  return (
    <div
      style={{
        width: s,
        height: s,
        borderRadius: radius,
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.32),
        fontWeight: 600,
        letterSpacing: '.02em',
        background: 'var(--bg2)',
        color: 'var(--ink2)',
      }}
    >
      {club.short.slice(0, 4)}
    </div>
  );
}
