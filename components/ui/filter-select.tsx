type FilterOption = {
  value: string;
  label: string;
};

export function FilterSelect({
  label,
  value,
  onChange,
  allLabel,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: FilterOption[];
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-9 min-w-32 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus:border-ring focus:ring-3 focus:ring-ring/20"
    >
      <option value="">{allLabel}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
