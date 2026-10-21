import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Printer } from "lucide-react";
import { toast } from "sonner";

type Protocol = { id: string; label: string; position: number };

const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const WEEKDAYS = ["Su", "M", "T", "W", "Th", "F", "Sa"];
const SLEEP_ROWS = [9, 8, 7, 6, 5];
const SEED_COUNT = 12;
const EMPTY_SET = new Set<string>();

interface ProtocolRowProps {
  protocol: Protocol;
  dates: string[];
  todayKey: string;
  gridTemplate: string;
  checkedDates: Set<string>;
  onToggle: (protocolId: string, date: string) => void;
  onRename: (protocolId: string, label: string) => void;
  onDelete: (protocolId: string) => void;
}

const ProtocolRow = memo(function ProtocolRow({
  protocol,
  dates,
  todayKey,
  gridTemplate,
  checkedDates,
  onToggle,
  onRename,
  onDelete,
}: ProtocolRowProps) {
  const [label, setLabel] = useState(protocol.label);

  useEffect(() => {
    setLabel(protocol.label);
  }, [protocol.label]);

  const handleBlur = () => {
    const trimmed = label.trim();
    if (trimmed && trimmed !== protocol.label) {
      onRename(protocol.id, trimmed);
    } else if (!trimmed) {
      setLabel(protocol.label);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const completedDays = checkedDates?.size ?? 0;

  return (
    <div
      className="group grid border-b border-border/70 last:border-b-0"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex items-center gap-1 border-r border-border/70 px-2 pl-4">
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label="Protocol name"
          className="w-full rounded-sm bg-transparent px-1 py-1 text-sm outline-none focus:bg-secondary/70"
        />
        <span
          className="shrink-0 font-mono text-[10px] text-muted-foreground/75 tabular-nums print:text-foreground"
          title={`${completedDays} of ${dates.length} days`}
        >
          {completedDays}d
        </span>
        <button
          onClick={() => onDelete(protocol.id)}
          aria-label={`Delete ${protocol.label}`}
          className="print:hidden opacity-0 transition-opacity group-hover:opacity-100 grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        >
          ×
        </button>
      </div>
      {dates.map((d) => {
        const checked = checkedDates?.has(d) ?? false;
        return (
          <button
            key={d}
            onClick={() => onToggle(protocol.id, d)}
            aria-label={`${protocol.label} on ${d}`}
            aria-pressed={checked}
            className={`grid-cell ${checked ? "grid-cell-checked" : ""} ${d === todayKey ? "grid-cell-today" : ""}`}
          >
            {checked ? "✓" : ""}
          </button>
        );
      })}
    </div>
  );
});

interface SleepRowProps {
  hours: number;
  dates: string[];
  todayKey: string;
  gridTemplate: string;
  activeDates: Set<string>;
  onSetSleep: (date: string, hours: number) => void;
}

const SleepRow = memo(function SleepRow({
  hours,
  dates,
  todayKey,
  gridTemplate,
  activeDates,
  onSetSleep,
}: SleepRowProps) {
  return (
    <div
      className="grid border-b border-border/70 last:border-b-0"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex items-center border-r border-border/70 px-4 font-mono text-xs text-muted-foreground">
        {hours}hrs
      </div>
      {dates.map((d) => {
        const active = activeDates.has(d);
        return (
          <button
            key={d}
            onClick={() => onSetSleep(d, hours)}
            aria-label={`${hours} hours of sleep on ${d}`}
            aria-pressed={active}
            className={`grid-cell ${active ? "grid-cell-sleep" : ""} ${d === todayKey ? "grid-cell-today" : ""}`}
          />
        );
      })}
    </div>
  );
});

export function TrackerBoard({ userId }: { userId: string }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [checks, setChecks] = useState<Map<string, Set<string>>>(new Map());
  const [sleep, setSleep] = useState<Map<string, number>>(new Map());
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const monthKey = `${view.y}-${pad(view.m)}`;
  const daysInMonth = useMemo(() => new Date(view.y, view.m, 0).getDate(), [view]);
  const dates = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => dateKey(view.y, view.m, i + 1)),
    [view, daysInMonth],
  );
  const todayKey = dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());
  const isCurrentMonth = view.y === now.getFullYear() && view.m === now.getMonth() + 1;

  const monthLabel = useMemo(
    () =>
      new Date(view.y, view.m - 1, 1).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      }),
    [view.y, view.m],
  );

  const shiftMonth = useCallback((delta: number) => {
    setView((v) => {
      const d = new Date(v.y, v.m - 1 + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });
  }, []);

  const goToToday = useCallback(() => {
    const today = new Date();
    setView({ y: today.getFullYear(), m: today.getMonth() + 1 });
  }, []);

  // Cleanup pending note saving timer when switching months or unmounting
  useEffect(() => {
    return () => {
      if (noteTimer.current) {
        clearTimeout(noteTimer.current);
      }
    };
  }, [monthKey]);

  // Load (or seed) all data for the visible month
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const start = dateKey(view.y, view.m, 1);
      const end = dateKey(view.y, view.m, daysInMonth);

      const [protoRes, checkRes, sleepRes, noteRes] = await Promise.all([
        supabase
          .from("protocols")
          .select("id,label,position")
          .eq("user_id", userId)
          .order("position"),
        supabase
          .from("protocol_checks")
          .select("protocol_id,entry_date")
          .eq("user_id", userId)
          .eq("done", true)
          .gte("entry_date", start)
          .lte("entry_date", end),
        supabase
          .from("sleep_logs")
          .select("entry_date,hours")
          .eq("user_id", userId)
          .gte("entry_date", start)
          .lte("entry_date", end),
        supabase
          .from("month_notes")
          .select("note")
          .eq("user_id", userId)
          .eq("month_key", monthKey)
          .maybeSingle(),
      ]);

      if (cancelled) return;

      let protoList = (protoRes.data ?? []) as Protocol[];

      // Seed 12 blank protocols only on the very first visit for this user.
      // We track this with localStorage so deleting all protocols never re-seeds.
      const seededKey = `day-by-day:seeded:${userId}`;
      const alreadySeeded = localStorage.getItem(seededKey) === "1";
      if (!protoRes.error && protoList.length === 0 && !alreadySeeded) {
        const seed = Array.from({ length: SEED_COUNT }, (_, i) => ({
          user_id: userId,
          label: `Protocol ${i + 1}`,
          position: i,
        }));
        const ins = await supabase.from("protocols").insert(seed).select("id,label,position");
        if (!ins.error && ins.data) {
          protoList = ins.data as Protocol[];
          localStorage.setItem(seededKey, "1");
        }
      } else if (protoList.length > 0 && !alreadySeeded) {
        // Mark as seeded if protocols already exist (e.g. existing users)
        localStorage.setItem(seededKey, "1");
      }

      if (cancelled) return;

      // Group checks by protocol_id -> Set<entry_date>
      const checkMap = new Map<string, Set<string>>();
      for (const p of protoList) {
        checkMap.set(p.id, new Set<string>());
      }
      for (const r of checkRes.data ?? []) {
        let set = checkMap.get(r.protocol_id);
        if (!set) {
          set = new Set<string>();
          checkMap.set(r.protocol_id, set);
        }
        set.add(r.entry_date);
      }

      setProtocols(protoList);
      setChecks(checkMap);
      setSleep(
        new Map(
          (sleepRes.data ?? []).map((r: { entry_date: string; hours: number }) => [
            r.entry_date,
            Number(r.hours),
          ]),
        ),
      );
      setNote(noteRes.data?.note ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, monthKey, daysInMonth, view.y, view.m]);

  const toggleCheck = useCallback(
    (protocolId: string, date: string) => {
      // Determine new state synchronously from current checks map
      setChecks((prev) => {
        const next = new Map(prev);
        const currentSet = next.get(protocolId) ?? new Set<string>();
        const updatedSet = new Set(currentSet);
        const wasDone = updatedSet.has(date);
        if (wasDone) {
          updatedSet.delete(date);
        } else {
          updatedSet.add(date);
        }
        next.set(protocolId, updatedSet);

        // Fire Supabase inside updater so we know the actual previous value
        if (wasDone) {
          supabase
            .from("protocol_checks")
            .delete()
            .eq("protocol_id", protocolId)
            .eq("entry_date", date)
            .then(({ error }) => {
              if (error) console.error("toggleCheck delete:", error);
            });
        } else {
          supabase
            .from("protocol_checks")
            .upsert(
              { user_id: userId, protocol_id: protocolId, entry_date: date, done: true },
              { onConflict: "protocol_id,entry_date" },
            )
            .then(({ error }) => {
              if (error) console.error("toggleCheck upsert:", error);
            });
        }

        return next;
      });
    },
    [userId],
  );

  const setSleepDay = useCallback(
    (date: string, hours: number) => {
      setSleep((prev) => {
        const next = new Map(prev);
        const wasSet = next.get(date) === hours;
        if (wasSet) {
          next.delete(date);
          supabase
            .from("sleep_logs")
            .delete()
            .eq("user_id", userId)
            .eq("entry_date", date)
            .then(({ error }) => {
              if (error) console.error("setSleepDay delete:", error);
            });
        } else {
          next.set(date, hours);
          supabase
            .from("sleep_logs")
            .upsert(
              { user_id: userId, entry_date: date, hours },
              { onConflict: "user_id,entry_date" },
            )
            .then(({ error }) => {
              if (error) console.error("setSleepDay upsert:", error);
            });
        }
        return next;
      });
    },
    [userId],
  );

  const renameProtocol = useCallback(
    (id: string, label: string) => {
      setProtocols((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)));
      supabase
        .from("protocols")
        .update({ label })
        .eq("id", id)
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) console.error("renameProtocol:", error);
        });
    },
    [userId],
  );

  const addProtocol = useCallback(async () => {
    const nextPos = protocols.length;
    const label = `Protocol ${nextPos + 1}`;
    const { data, error } = await supabase
      .from("protocols")
      .insert({ user_id: userId, label, position: nextPos })
      .select("id,label,position");
    if (!error && data) {
      const added = data as Protocol[];
      setProtocols((prev) => [...prev, ...added]);
      setChecks((prev) => {
        const next = new Map(prev);
        for (const p of added) next.set(p.id, new Set<string>());
        return next;
      });
      toast.success("Protocol added");
    }
  }, [userId, protocols.length]);

  const deleteProtocol = useCallback(
    (id: string) => {
      const target = protocols.find((p) => p.id === id);
      setProtocols((prev) => prev.filter((p) => p.id !== id));
      setChecks((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      supabase.from("protocols").delete().eq("id", id);
      toast.info(`Deleted ${target?.label || "protocol"}`);
    },
    [protocols],
  );

  const saveNote = useCallback(
    (value: string) => {
      setNote(value);
      setSavingNote(true);
      if (noteTimer.current) clearTimeout(noteTimer.current);
      noteTimer.current = setTimeout(async () => {
        await supabase.from("month_notes").upsert(
          {
            user_id: userId,
            month_key: monthKey,
            note: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,month_key" },
        );
        setSavingNote(false);
      }, 700);
    },
    [userId, monthKey],
  );

  // Single-pass computation of all metrics and daily points
  const { dailyPoints, totalPoints, todayPoints, todayRate, perfectDays, avgSleep } =
    useMemo(() => {
      const daily = new Map<string, number>();
      for (const d of dates) daily.set(d, 0);

      let total = 0;
      for (const [, dateSet] of checks) {
        total += dateSet.size;
        for (const d of dateSet) {
          if (daily.has(d)) {
            daily.set(d, (daily.get(d) ?? 0) + 1);
          }
        }
      }

      let perfect = 0;
      const numProtocols = protocols.length;
      if (numProtocols > 0) {
        for (const d of dates) {
          if ((daily.get(d) ?? 0) === numProtocols) {
            perfect++;
          }
        }
      }

      const tPoints = daily.get(todayKey) ?? 0;
      const tRate = numProtocols ? Math.round((tPoints / numProtocols) * 100) : 0;

      const sleepVals = [...sleep.values()];
      const averageSleep = sleepVals.length
        ? (sleepVals.reduce((a, b) => a + b, 0) / sleepVals.length).toFixed(1)
        : null;

      return {
        dailyPoints: daily,
        totalPoints: total,
        todayPoints: tPoints,
        todayRate: tRate,
        perfectDays: perfect,
        avgSleep: averageSleep,
      };
    }, [checks, protocols.length, dates, todayKey, sleep]);

  // Pre-index sleep dates by hour row for instant lookups
  const sleepByHour = useMemo(() => {
    const map = new Map<number, Set<string>>();
    for (const h of SLEEP_ROWS) map.set(h, new Set<string>());
    for (const [d, h] of sleep) {
      map.get(h)?.add(d);
    }
    return map;
  }, [sleep]);

  const gridTemplate = `12rem repeat(${daysInMonth}, minmax(2.1rem, 1fr))`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Month navigation & stats */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="print:hidden grid size-9 place-items-center rounded-sm border border-foreground/15 bg-card transition-colors hover:bg-secondary"
          >
            ‹
          </button>
          <h2 className="min-w-44 text-center font-display text-2xl font-black italic tracking-tight">
            {monthLabel}
          </h2>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="print:hidden grid size-9 place-items-center rounded-sm border border-foreground/15 bg-card transition-colors hover:bg-secondary"
          >
            ›
          </button>
          {!isCurrentMonth && (
            <button
              onClick={goToToday}
              className="print:hidden rounded-sm border border-foreground/15 bg-card px-2.5 py-1 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              title="Jump to current month"
            >
              Today
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <dl className="flex gap-6 font-mono text-xs">
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Total points
              </dt>
              <dd className="text-xl font-semibold text-primary">{loading ? "–" : totalPoints}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Today's score
              </dt>
              <dd className="text-xl font-semibold text-primary">
                {loading ? "–" : `${todayPoints}/${protocols.length}`}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  ({todayRate}%)
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Perfect days
              </dt>
              <dd className="text-xl font-semibold">{loading ? "–" : perfectDays}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Avg sleep
              </dt>
              <dd className="text-xl font-semibold">
                {loading ? "–" : avgSleep ? `${avgSleep}h` : "–"}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => window.print()}
            aria-label="Print monthly tracker"
            className="print:hidden inline-flex items-center gap-1.5 rounded-sm border border-foreground/15 bg-card px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Print or export tracker sheet"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Print sheet</span>
          </button>
        </div>
      </div>

      {loading ? (
        <p className="py-24 text-center font-mono text-sm text-muted-foreground">
          Loading your dashboard…
        </p>
      ) : (
        <>
          {/* Protocols grid */}
          <div className="overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm">
            <div className="min-w-max">
              <div
                className="grid border-b border-foreground/15"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="flex items-center justify-between border-r border-border/70 px-4 py-2 font-display text-sm font-bold">
                  Protocols
                  <button
                    onClick={addProtocol}
                    className="print:hidden rounded-sm border border-foreground/15 px-2 py-0.5 font-mono text-[10px] font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                  >
                    + Add
                  </button>
                </div>
                {dates.map((d, i) => (
                  <div
                    key={d}
                    className={`flex flex-col items-center justify-center border-r border-border/70 py-1 font-mono text-[10px] ${d === todayKey ? "grid-cell-today" : ""}`}
                  >
                    <span className="font-semibold">{i + 1}</span>
                    <span className="text-muted-foreground">
                      {WEEKDAYS[new Date(view.y, view.m - 1, i + 1).getDay()]}
                    </span>
                  </div>
                ))}
              </div>

              {protocols.map((p) => (
                <ProtocolRow
                  key={p.id}
                  protocol={p}
                  dates={dates}
                  todayKey={todayKey}
                  gridTemplate={gridTemplate}
                  checkedDates={checks.get(p.id) ?? EMPTY_SET}
                  onToggle={toggleCheck}
                  onRename={renameProtocol}
                  onDelete={deleteProtocol}
                />
              ))}

              {/* Total points row */}
              <div className="grid bg-muted/60" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="border-r border-border/70 px-4 py-2 font-display text-sm font-bold">
                  Total Points
                </div>
                {dates.map((d) => (
                  <div
                    key={d}
                    className={`grid-cell cursor-default border-b-0 border-l-0 ${d === todayKey ? "grid-cell-today" : ""}`}
                  >
                    {dailyPoints.get(d) ?? 0}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep grid */}
          <div className="mt-8 overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm">
            <div className="min-w-max">
              <div
                className="grid border-b border-foreground/15"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="border-r border-border/70 px-4 py-2 font-display text-sm font-bold">
                  Sleep
                </div>
                {dates.map((d, i) => (
                  <div
                    key={d}
                    className={`flex flex-col items-center justify-center border-r border-border/70 py-1 font-mono text-[10px] ${d === todayKey ? "grid-cell-today" : ""}`}
                  >
                    <span className="font-semibold">{i + 1}</span>
                    <span className="text-muted-foreground">
                      {WEEKDAYS[new Date(view.y, view.m - 1, i + 1).getDay()]}
                    </span>
                  </div>
                ))}
              </div>
              {SLEEP_ROWS.map((hours) => (
                <SleepRow
                  key={hours}
                  hours={hours}
                  dates={dates}
                  todayKey={todayKey}
                  gridTemplate={gridTemplate}
                  activeDates={sleepByHour.get(hours) ?? EMPTY_SET}
                  onSetSleep={setSleepDay}
                />
              ))}
            </div>
          </div>

          {/* Monthly note */}
          <div className="mt-8 rounded-lg border border-foreground/15 bg-card p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <label htmlFor="month-note" className="font-display text-sm font-bold">
                Note
              </label>
              <span className="font-mono text-[10px] text-muted-foreground print:hidden">
                {savingNote ? "Saving…" : "Saved automatically"}
              </span>
            </div>
            <textarea
              id="month-note"
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              rows={3}
              placeholder="What worked this month? What will you adjust?"
              className="w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </>
      )}
    </div>
  );
}
