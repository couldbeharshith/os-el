export const DotPattern = ({
  width,
  height,
  cx,
  cy,
  cr,
  className,
}: {
  width: number;
  height: number;
  cx: number;
  cy: number;
  cr: number;
  className?: string;
}) => {
  return (
    <svg
      className={className}
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id="dotPattern"
          x="0"
          y="0"
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
        >
          <circle cx={cx} cy={cy} r={cr} fill="currentColor" opacity={0.2} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dotPattern)" />
    </svg>
  );
}; 