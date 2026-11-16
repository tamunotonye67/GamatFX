import { Check } from "lucide-react";
import { PRESET_AVATARS } from "../lib/avatars";

export default function AvatarPicker({
  value,
  onChange,
  title = "Or choose a preset avatar",
  subtitle = "Prefer not to use a real photo? Pick a modern avatar instead.",
  compact = false,
}: {
  value?: string;
  onChange: (avatarUrl: string) => void;
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "mt-6 pt-6 border-t border-line"}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-ink">
            {title}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted">{subtitle}</p>
          )}
        </div>
        {value && PRESET_AVATARS.some((a) => a.url === value) && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-xs font-semibold text-muted hover:text-brand transition-colors cursor-pointer"
          >
            Clear selection
          </button>
        )}
      </div>

      <div
        className={`mt-3 grid gap-2.5 ${
          compact
            ? "grid-cols-6 sm:grid-cols-6"
            : "grid-cols-4 sm:grid-cols-6 md:grid-cols-12"
        }`}
      >
        {PRESET_AVATARS.map((av) => {
          const selected = value === av.url;
          return (
            <button
              key={av.id}
              type="button"
              onClick={() => onChange(av.url)}
              title={av.label}
              aria-label={`Select ${av.label} avatar`}
              aria-pressed={selected}
              className={`group relative aspect-square w-full overflow-hidden rounded-2xl border-2 transition-all cursor-pointer ${
                selected
                  ? "border-brand ring-2 ring-brand/25 scale-105 shadow-md"
                  : "border-line hover:border-ink/40 hover:scale-105"
              }`}
            >
              <img
                src={av.url}
                alt={av.label}
                className="h-full w-full object-cover"
              />
              {selected && (
                <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand text-white shadow-xs">
                  <Check className="h-2.5 w-2.5" strokeWidth={3} />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
