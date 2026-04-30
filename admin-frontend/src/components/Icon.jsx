const PATHS = {
  search: ['M10.5 18a7.5 7.5 0 1 1 5.3-12.8A7.5 7.5 0 0 1 10.5 18Z', 'M16 16l4 4'],
  chart: ['M4 19V5', 'M4 19h16', 'M8 16V9', 'M12 16V6', 'M16 16v-4'],
  package: ['M21 8l-9-5-9 5 9 5 9-5Z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
  tag: ['M20 12l-8 8-9-9V4h7l10 8Z', 'M7.5 7.5h.01'],
  users: ['M16 21a6 6 0 0 0-12 0', 'M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21a5 5 0 0 0-5-5', 'M17 3.3a4 4 0 0 1 0 7.4'],
  activity: ['M4 12h4l2-6 4 12 2-6h4'],
  clock: ['M12 6v6l4 2', 'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z'],
  check: ['M5 12l4 4L19 6'],
  x: ['M18 6 6 18', 'M6 6l12 12'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  lock: ['M7 11V8a5 5 0 0 1 10 0v3', 'M6 11h12v10H6z'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z'],
  shield: ['M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6l8-3Z', 'M9 12l2 2 4-5'],
  arrowLeft: ['M19 12H5', 'M12 19l-7-7 7-7'],
  filter: ['M4 5h16', 'M7 12h10', 'M10 19h4'],
  refresh: ['M20 11a8 8 0 0 0-14.9-4', 'M4 5v5h5', 'M4 13a8 8 0 0 0 14.9 4', 'M20 19v-5h-5'],
  alert: ['M12 9v4', 'M12 17h.01', 'M10.3 4.3 2 20h19.4l-9.7-15.7Z'],
};

export default function Icon({ name, size = 18, stroke = 2, className = '', title }) {
  const paths = PATHS[name] || PATHS.activity;

  return (
    <svg
      className={`icon-svg ${className}`.trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : 'true'}
      role={title ? 'img' : undefined}
    >
      {title && <title>{title}</title>}
      {paths.map((d) => <path key={d} d={d} />)}
    </svg>
  );
}
