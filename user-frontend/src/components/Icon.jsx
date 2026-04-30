const PATHS = {
  search: ['M10.5 18a7.5 7.5 0 1 1 5.3-12.8A7.5 7.5 0 0 1 10.5 18Z', 'M16 16l4 4'],
  report: ['M8 3h8l4 4v14H4V3h4Z', 'M14 3v6h6', 'M8 13h8', 'M8 17h5'],
  shield: ['M12 3l8 3v6c0 5-3.4 8.3-8 9-4.6-.7-8-4-8-9V6l8-3Z', 'M9 12l2 2 4-5'],
  activity: ['M4 12h4l2-6 4 12 2-6h4'],
  package: ['M21 8l-9-5-9 5 9 5 9-5Z', 'M3 8v8l9 5 9-5V8', 'M12 13v8'],
  map: ['M12 21s7-4.6 7-11a7 7 0 0 0-14 0c0 6.4 7 11 7 11Z', 'M12 10.5h.01'],
  calendar: ['M7 3v4', 'M17 3v4', 'M4 9h16', 'M5 5h14v16H5z'],
  user: ['M20 21a8 8 0 0 0-16 0', 'M12 13a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z'],
  lock: ['M7 11V8a5 5 0 0 1 10 0v3', 'M6 11h12v10H6z'],
  plus: ['M12 5v14', 'M5 12h14'],
  tag: ['M20 12l-8 8-9-9V4h7l10 8Z', 'M7.5 7.5h.01'],
  arrowLeft: ['M19 12H5', 'M12 19l-7-7 7-7'],
  trash: ['M4 7h16', 'M10 11v6', 'M14 11v6', 'M6 7l1 14h10l1-14', 'M9 7V4h6v3'],
  check: ['M5 12l4 4L19 6'],
  filter: ['M4 5h16', 'M7 12h10', 'M10 19h4'],
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
