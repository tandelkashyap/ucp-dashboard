export function Field({
  label,
  name,
  type,
  autoComplete,
  error,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
  error?: string[];
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-ink outline-none transition-colors focus:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
      />
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm text-danger">
          {error[0]}
        </p>
      )}
    </div>
  );
}
