const LABEL = { MENUNGGU: 'Menunggu', DISETUJUI: 'Disetujui', DIREVISI: 'Direvisi' } as const;

export const StatusBadge = ({ status }: { status: keyof typeof LABEL }) => (
  <span className={`status status-${status.toLowerCase()}`}>{LABEL[status]}</span>
);
