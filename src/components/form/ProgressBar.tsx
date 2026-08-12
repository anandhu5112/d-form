"use client";

interface ProgressBarProps {
  step: number;
  totalSteps: number;
}

export default function ProgressBar({ step, totalSteps }: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (step / totalSteps) * 100));

  return (
    <div className="w-full rounded-full bg-[#f2f2f2] p-1">
      <div
        className="h-1 rounded-full bg-[#008a25] shadow-[0_2px_4px_rgba(0,181,49,0.4)] transition-[width] duration-300 motion-reduce:transition-none"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
