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
      className="min-h-11 min-w-32 rounded-xl border border-[#dce5dd] bg-white px-3.5 text-sm text-[#303830] outline-none focus:border-[#55b97a] focus:ring-3 focus:ring-[#55b97a]/15"
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
