export function ToolPrefCheckbox({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-2 rounded-md border border-navy-700 p-2.5 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-4 w-4 rounded border-navy-600 bg-navy-900 text-cyan-500 focus:ring-cyan-400"
      />
      <span className="text-navy-200">{label}</span>
    </label>
  );
}

export function ToolResultStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-navy-800/60 p-3">
      <dt className="text-[11px] text-navy-300">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}
