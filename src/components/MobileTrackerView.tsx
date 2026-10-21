import { memo, useCallback, useMemo, useState } from "react";

type Protocol = { id: string; label: string; position: number };

const SLEEP_OPTIONS = [5, 6, 7, 8, 9];
const WEEKDAY_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const WEEKDAY_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getWeekStart(dateStr: string): Date {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

interface MobileTrackerViewProps {
  protocols: Protocol[];
  dates: string[];
  todayKey: string;
  checks: Map<string, Set<string>>;
  sleep: Map<string, number>;
  onToggle: (protocolId: string, date: string) => void;
  onSetSleep: (date: string, hours: number) => void;
  totalPoints: number;
  todayPoints: number;
  todayRate: number;
  perfectDays: number;
  avgSleep: string | null;
  loading: boolean;
  note: string;
  savingNote: boolean;
  onSaveNote: (v: string) => void;
  onAddProtocol: () => void;
  onDeleteProtocol: (id: string) => void;
  onRenameProtocol: (id: string, label: string) => void;
}

const DayCard = memo(function DayCard({
  dateKey,
  isToday,
  protocols,
  checks,
  sleepHours,
  onToggle,
  onSetSleep,
}: {
  dateKey: string;
  isToday: boolean;
  protocols: Protocol[];
  checks: Map<string, Set<string>>;
  sleepHours: number | undefined;
  onToggle: (protocolId: string, date: string) => void;
  onSetSleep: (date: string, hours: number) => void;
}) {
  const d = new Date(dateKey + "T00:00:00");
  const dayNum = d.getDate();
  const weekdayShort = WEEKDAY_SHORT[d.getDay()];
  const weekdayFull = WEEKDAY_FULL[d.getDay()];
  const score = protocols.filter((p) => checks.get(p.id)?.has(dateKey)).length;

  const handleSleepTap = useCallback(
    (h: number) => onSetSleep(dateKey, h),
    [dateKey, onSetSleep],
  );

  return (
    <article
      className={`rounded-lg border bg-card shadow-sm ${isToday ? "border-ring ring-1 ring-ring/60" : "border-foreground/15"}`}
    >
      <div
        className={`flex items-center justify-between rounded-t-lg px-4 py-2 ${isToday ? "bg-primary/10" : "bg-muted/40"}`}
      >
        <div className="flex items-baseline gap-2">
          <span className="font-display text-lg font-black italic leading-none">{dayNum}</span>
          <span className="font-mono text-xs text-muted-foreground" title={weekdayFull}>
            {weekdayShort}
          </span>
          {isToday && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider text-primary-foreground">
              Today
            </span>
          )}
        </div>
        <span className="font-mono text-xs text-muted-foreground">
          {score}/{protocols.length}
        </span>
      </div>

      {protocols.length > 0 ? (
        <div className="flex flex-wrap gap-2 px-4 py-3">
          {protocols.map((p) => {
            const checked = checks.get(p.id)?.has(dateKey) ?? false;
            return (
              <button
                key={p.id}
                onClick={() => onToggle(p.id, dateKey)}
                aria-label={`${p.label} on ${dateKey}`}
                aria-pressed={checked}
                className={`min-h-[44px] rounded-md border px-3 py-2 text-left text-xs font-medium transition-colors ${
                  checked
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-foreground hover:bg-secondary"
                }`}
              >
                {checked ? "✓ " : ""}
                {p.label}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="px-4 py-3 font-mono text-xs italic text-muted-foreground">
          No protocols yet.
        </p>
      )}

      <div className="flex items-center gap-2 border-t border-border/50 px-4 py-2">
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Sleep
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SLEEP_OPTIONS.map((h) => {
            const active = sleepHours === h;
            return (
              <button
                key={h}
                onClick={() => handleSleepTap(h)}
                aria-label={`${h} hours sleep on ${dateKey}`}
                aria-pressed={active}
                className={`min-h-[36px] min-w-[40px] rounded-md border px-2 py-1 font-mono text-xs transition-colors ${
                  active
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-secondary"
                }`}
              >
                {h}h
              </button>
            );
          })}
        </div>
      </div>
    </article>
  );
});

export function MobileTrackerView({
  protocols,
  dates,
  todayKey,
  checks,
  sleep,
  onToggle,
  onSetSleep,
  totalPoints,
  todayPoints,
  todayRate,
  perfectDays,
  avgSleep,
  loading,
  note,
  savingNote,
  onSaveNote,
  onAddProtocol,
  onDeleteProtocol,
  onRenameProtocol,
}: MobileTrackerViewProps) {
  const [weekStart, setWeekStart] = useState<Date>(() => getWeekStart(todayKey));

  const weekDates = useMemo(
    () => Array.from({ length: 7 }, (_, i) => toDateKey(addDays(weekStart, i))),
    [weekStart],
  );

  const visibleDates = useMemo(
    () => weekDates.filter((d) => dates.includes(d)),
    [weekDates, dates],
  );

  const shiftWeek = useCallback((delta: number) => {
    setWeekStart((prev) => addDays(prev, delta * 7));
  }, []);

  const goToTodayWeek = useCallback(() => {
    setWeekStart(getWeekStart(todayKey));
  }, [todayKey]);

  const isThisWeek = useMemo(() => weekDates.includes(todayKey), [weekDates, todayKey]);

  const weekLabel = useMemo(() => {
    const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    return `${fmt(new Date(weekDates[0] + "T00:00:00"))} – ${fmt(new Date(weekDates[6] + "T00:00:00"))}`;
  }, [weekDates]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");

  const startEdit = (p: Protocol) => {
    setEditingId(p.id);
    setEditLabel(p.label);
  };

  const commitEdit = () => {
    if (editingId) {
      const trimmed = editLabel.trim();
      if (trimmed) onRenameProtocol(editingId, trimmed);
    }
    setEditingId(null);
    setEditLabel("");
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Stats strip */}
      {!loading && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Total points", value: String(totalPoints), accent: true },
            {
              label: "Today's score",
              value: `${todayPoints}/${protocols.length} (${todayRate}%)`,
              accent: true,
            },
            { label: "Perfect days", value: String(perfectDays), accent: false },
            { label: "Avg sleep", value: avgSleep ? `${avgSleep}h` : "–", accent: false },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="rounded-lg border border-foreground/15 bg-card px-3 py-2 shadow-sm"
            >
              <dt className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                {label}
              </dt>
              <dd
                className={`mt-0.5 font-mono text-base font-semibold ${accent ? "text-primary" : ""}`}
              >
                {value}
              </dd>
            </div>
          ))}
        </div>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={() => shiftWeek(-1)}
          aria-label="Previous week"
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-foreground/15 bg-card text-xl transition-colors hover:bg-secondary"
        >
          ‹
        </button>
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] text-muted-foreground">Week of</span>
          <span className="font-display text-sm font-bold">{weekLabel}</span>
        </div>
        <button
          onClick={() => shiftWeek(1)}
          aria-label="Next week"
          className="grid size-10 shrink-0 place-items-center rounded-lg border border-foreground/15 bg-card text-xl transition-colors hover:bg-secondary"
        >
          ›
        </button>
      </div>

      {!isThisWeek && (
        <button
          onClick={goToTodayWeek}
          className="w-full rounded-lg border border-foreground/15 bg-card py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
        >
          Jump to this week
        </button>
      )}

      {/* Day cards */}
      {loading ? (
        <p className="py-16 text-center font-mono text-sm text-muted-foreground">
          Loading your dashboard…
        </p>
      ) : visibleDates.length === 0 ? (
        <p className="py-8 text-center font-mono text-xs text-muted-foreground">
          No days in this month for the selected week.
        </p>
      ) : (
        <div className="space-y-3">
          {visibleDates.map((d) => (
            <DayCard
              key={d}
              dateKey={d}
              isToday={d === todayKey}
              protocols={protocols}
              checks={checks}
              sleepHours={sleep.get(d)}
              onToggle={onToggle}
              onSetSleep={onSetSleep}
            />
          ))}
        </div>
      )}

      {/* Protocol manager */}
      <div className="rounded-lg border border-foreground/15 bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
          <span className="font-display text-sm font-bold">Protocols</span>
          <button
            onClick={onAddProtocol}
            className="rounded-md border border-foreground/15 px-3 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            + Add
          </button>
        </div>
        {protocols.length === 0 ? (
          <p className="px-4 py-4 font-mono text-xs italic text-muted-foreground">
            No protocols yet. Tap + Add to create one.
          </p>
        ) : (
          <ul className="divide-y divide-border/50">
            {protocols.map((p) => (
              <li key={p.id} className="flex items-center gap-2 px-4 py-2">
                {editingId === p.id ? (
                  <input
                    autoFocus
                    value={editLabel}
                    onChange={(e) => setEditLabel(e.target.value)}
                    onBlur={commitEdit}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") e.currentTarget.blur();
                      if (e.key === "Escape") {
                        setEditingId(null);
                        setEditLabel("");
                      }
                    }}
                    className="min-h-[40px] flex-1 rounded-md border border-input bg-background px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-ring"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(p)}
                    className="min-h-[40px] flex-1 rounded-md px-2 py-1 text-left text-sm transition-colors hover:bg-secondary"
                    aria-label={`Rename ${p.label}`}
                  >
                    {p.label}
                  </button>
                )}
                <button
                  onClick={() => onDeleteProtocol(p.id)}
                  aria-label={`Delete ${p.label}`}
                  className="grid size-10 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Monthly note */}
      <div className="rounded-lg border border-foreground/15 bg-card p-4 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <label htmlFor="mobile-month-note" className="font-display text-sm font-bold">
            Note
          </label>
          <span className="font-mono text-[10px] text-muted-foreground">
            {savingNote ? "Saving…" : "Saved automatically"}
          </span>
        </div>
        <textarea
          id="mobile-month-note"
          value={note}
          onChange={(e) => onSaveNote(e.target.value)}
          rows={4}
          placeholder="What worked this month? What will you adjust?"
          className="w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  );
}
