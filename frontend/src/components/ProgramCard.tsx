interface ProgramCardProps {
  name: string;
  year?: string;
  type?: string;
  onClick?: () => void;
  className?: string;
}

export function ProgramCard({
  name,
  year,
  type,
  onClick,
  className = '',
}: ProgramCardProps) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full bg-pure-white rounded-dawangi p-5 shadow-dawangi
        hover:shadow-lg hover:scale-[1.02] transition-all duration-200
        text-left focus:outline-none focus:ring-2 focus:ring-focus-ring
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-charcoal mb-1">{name}</h3>
          <div className="flex gap-2 text-sm text-cool-gray">
            {type && <span className="text-cbnu-red font-medium">{type}</span>}
            {year && <span>• 개설: {year}</span>}
          </div>
        </div>
        <svg
          className="w-6 h-6 text-cool-gray flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
