export default function SortifyMark({ size = 20 }: { size?: number }) {
  return (
    <svg className="mark" width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="18" height="18" stroke="currentColor" strokeWidth="1.2" />
      <path d="M1 10 H19 M10 1 V19" stroke="currentColor" strokeWidth="1.2" />
      <rect x="5" y="5" width="4" height="4" fill="currentColor" />
      <rect x="11" y="11" width="4" height="4" fill="currentColor" />
    </svg>
  );
}
