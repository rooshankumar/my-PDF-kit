interface ProgressBarProps {
  value: number;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, className = "", barClassName = "" }: ProgressBarProps) {
  return (
    <div className={`w-full bg-secondary-light dark:bg-dark-bg rounded-full ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-300 ease-out
          bg-gradient-to-r from-[#FF5733] via-[#FF4500] to-[#FF1493]
          dark:from-[#FF5733] dark:via-[#FF0000] dark:to-[#FF1493] ${barClassName}`}
        style={{ width: `${value}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
} 