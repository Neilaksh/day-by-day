import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Printer } from "lucide-react";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";
import { MobileTrackerView } from "./MobileTrackerView";

type Protocol = { id: string; label: string; position: number };

const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const WEEKDAYS = ["Su", "M", "T", "W", "Th", "F", "Sa"];
const SLEEP_ROWS = [9, 8, 7, 6, 5];

// Query keys for TanStack Query caching
const qk = {
  protocols: (userId: string) => ["protocols", userId] as const,
  checks: (userId: string, monthKey: string) => ["checks", userId, monthKey] as const,
  sleep: (userId: string, monthKey: string) => ["sleep", userId, monthKey] as const,
  note: (userId: string, monthKey: string) => ["note", userId, monthKey] as const,
};

// ================= Memoized leaf cells =================

const ProtocolCell = memo(function ProtocolCell({
  checked,
  todayKey,
  d,
  protocolId,
  protocolLabel,
  onToggle,
}: {
  checked: boolean;
  todayKey: string;
  d: string;
  protocolId: string;
  protocolLabel: string;
  onToggle: (protocolId: string, date: string) => void;
}) {
  const dayNum = d.slice(-2);
  return (
    <button
      key={d}
      onClick={() => onToggle(protocolId, d)}
      role="checkbox"
      aria-checked={checked}
      aria-label={`${protocolLabel}, day ${dayNum}: ${checked ? "completed" : "not completed"}`}
      className={`grid-cell ${checked ? "grid-cell-checked" : ""} ${d === todayKey ? "grid-cell-today" : ""}`}
    >
      <span aria-hidden="true">{checked ? "✓" : ""}</span>
    </button>
  );
});
ProtocolCell.displayName = "ProtocolCell";

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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleBlur = useCallback(() => {
    const trimmed = label.trim();
    if (trimmed && trimmed !== protocol.label) {
      onRename(protocol.id, trimmed);
    } else {
      setLabel(protocol.label);
    }
  }, [label, protocol.label, protocol.id, onRename]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") e.currentTarget.blur();
    },
    [],
  );

  const completedDays = checkedDates.size;

  // Check if date d has sleep active by checking all sleep hours
  return (
    <div
      className="group grid border-b border-border/70 last:border-b-0"
      style={{ gridTemplateColumns: gridTemplate }}
    >
      <div className="flex items-center gap-1 border-r border-border/70 px-2 pl-4">
        <input
          defaultValue={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          aria-label={`Protocol name: ${protocol.label}`}
          className="w-full rounded-sm bg-transparent px-1 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring focus:bg-secondary/70"
        />
        <span
          className="shrink-0 font-mono text-[10px] text-muted-foreground font-medium tabular-nums print:text-foreground"
          title={`${completedDays} of ${dates.length} days`}
        >
          {completedDays}d
        </span>

        {confirmDelete ? (
          <div className="flex items-center gap-1 print:hidden shrink-0">
            <button
              type="button"
              onClick={() => {
                onDelete(protocol.id);
                setConfirmDelete(false);
              }}
              aria-label={`Confirm delete ${protocol.label}`}
              className="rounded px-1.5 py-0.5 text-[10px] font-bold bg-destructive text-destructive-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              Del
            </button>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              aria-label="Cancel delete"
              className="rounded px-1 py-0.5 text-[10px] text-muted-foreground hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            aria-label={`Delete protocol ${protocol.label}`}
            className="print:hidden opacity-40 hover:opacity-100 focus-visible:opacity-100 transition-opacity grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring"
          >
            ×
          </button>
        )}
      </div>
      {dates.map((d) => {
        const checked = checkedDates.has(d);
        return (
          <ProtocolCell
            key={d}
            checked={checked}
            todayKey={todayKey}
            d={d}
            protocolId={protocol.id}
            protocolLabel={protocol.label}
            onToggle={onToggle}
          />
        );
      })}
    </div>
  );
});
ProtocolRow.displayName = "ProtocolRow";

const SleepCell = memo(function SleepCell({
  active,
  todayKey,
  d,
  hours,
  onSetSleep,
}: {
  active: boolean;
  todayKey: string;
  d: string;
  hours: number;
  onSetSleep: (date: string, hours: number) => void;
}) {
  const dayNum = d.slice(-2);
  return (
    <button
      key={d}
      onClick={() => onSetSleep(d, hours)}
      role="checkbox"
      aria-checked={active}
      aria-label={`${hours} hours of sleep, day ${dayNum}: ${active ? "logged" : "not logged"}`}
      className={`grid-cell ${active ? "grid-cell-sleep" : ""} ${d === todayKey ? "grid-cell-today" : ""}`}
    />
  );
});
SleepCell.displayName = "SleepCell";

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
          <SleepCell
            key={d}
            active={active}
            todayKey={todayKey}
            d={d}
            hours={hours}
            onSetSleep={onSetSleep}
          />
        );
      })}
    </div>
  );
});
SleepRow.displayName = "SleepRow";

export function TrackerBoard({ userId }: { userId: string }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [checks, setChecks] = useState<Map<string, Set<string>>>(new Map());
  const [sleep, setSleep] = useState<Map<string, number>>(new Map());
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const queryClient = useQueryClient();

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

  // ================= TanStack Query data fetching =================
  const start = dateKey(view.y, view.m, 1);
  const end = dateKey(view.y, view.m, daysInMonth);

  const protocolsQuery = useQuery({
    queryKey: qk.protocols(userId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocols")
        .select("id,label,position")
        .eq("user_id", userId)
        .order("position");
      if (error) throw error;
      return (data ?? []) as Protocol[];
    },
    enabled: !!userId,
  });

  const checksQuery = useQuery({
    queryKey: qk.checks(userId, monthKey),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("protocol_checks")
        .select("protocol_id,entry_date")
        .eq("user_id", userId)
        .eq("done", true)
        .gte("entry_date", start)
        .lte("entry_date", end);
      if (error) throw error;
      return (data ?? []) as { protocol_id: string; entry_date: string }[];
    },
    enabled: !!userId,
  });

  const sleepQuery = useQuery({
    queryKey: qk.sleep(userId, monthKey),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("sleep_logs")
        .select("entry_date,hours")
        .eq("user_id", userId)
        .gte("entry_date", start)
        .lte("entry_date", end);
      if (error) throw error;
      return (data ?? []) as { entry_date: string; hours: number }[];
    },
    enabled: !!userId,
  });

  const noteQuery = useQuery({
    queryKey: qk.note(userId, monthKey),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("month_notes")
        .select("note")
        .eq("user_id", userId)
        .eq("month_key", monthKey)
        .maybeSingle();
      if (error) throw error;
      return data?.note ?? "";
    },
    enabled: !!userId,
  });

  const loading =
    protocolsQuery.isLoading ||
    checksQuery.isLoading ||
    sleepQuery.isLoading ||
    noteQuery.isLoading;

  // Sync local optimistic state from query results when they change
  useEffect(() => {
    if (protocolsQuery.data) setProtocols(protocolsQuery.data);
  }, [protocolsQuery.data]);

  useEffect(() => {
    if (!checksQuery.data) return;
    const map = new Map<string, Set<string>>();
    (protocolsQuery.data ?? []).forEach((p) => map.set(p.id, new Set<string>()));
    for (const r of checksQuery.data) {
      let set = map.get(r.protocol_id);
      if (!set) {
        set = new Set<string>();
        map.set(r.protocol_id, set);
      }
      set.add(r.entry_date);
    }
    setChecks(map);
  }, [checksQuery.data, protocolsQuery.data]);

  useEffect(() => {
    if (!sleepQuery.data) return;
    setSleep(
      new Map(
        (sleepQuery.data ?? []).map((r) => [r.entry_date, Number(r.hours)] as [string, number]),
      ),
    );
  }, [sleepQuery.data]);

  useEffect(() => {
    if (noteQuery.data !== undefined) setNote(noteQuery.data);
  }, [noteQuery.data]);

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
        const promise = wasDone
          ? supabase
            .from("protocol_checks")
            .delete()
            .eq("protocol_id", protocolId)
            .eq("entry_date", date)
          : supabase
            .from("protocol_checks")
            .upsert(
              { user_id: userId, protocol_id: protocolId, entry_date: date, done: true },
              { onConflict: "protocol_id,entry_date" },
            );

        promise.then(({ error }) => {
          if (error) console.error("toggleCheck:", error);
          queryClient.invalidateQueries({ queryKey: qk.checks(userId, monthKey) });
        });

        return next;
      });
    },
    [userId, monthKey, queryClient],
  );

  const setSleepDay = useCallback(
    (date: string, hours: number) => {
      setSleep((prev) => {
        const next = new Map(prev);
        const wasSet = next.has(date);
        if (wasSet) {
          next.delete(date);
          supabase
            .from("sleep_logs")
            .delete()
            .eq("user_id", userId)
            .eq("entry_date", date)
            .then(({ error }) => {
              if (error) console.error("setSleepDay delete:", error);
              queryClient.invalidateQueries({ queryKey: qk.sleep(userId, monthKey) });
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
              queryClient.invalidateQueries({ queryKey: qk.sleep(userId, monthKey) });
            });
        }
        return next;
      });
    },
    [userId, monthKey, queryClient],
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
          queryClient.invalidateQueries({ queryKey: qk.protocols(userId) });
        });
    },
    [userId, queryClient],
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
      queryClient.invalidateQueries({ queryKey: qk.protocols(userId) });
      queryClient.invalidateQueries({ queryKey: qk.checks(userId, monthKey) });
      toast.success("Protocol added");
    }
  }, [userId, protocols.length, monthKey, queryClient]);

  const deleteProtocol = useCallback(
    (id: string) => {
      const target = protocols.find((p) => p.id === id);
      // Optimistically remove from UI
      setProtocols((prev) => prev.filter((p) => p.id !== id));
      setChecks((prev) => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
      supabase
        .from("protocols")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
        .then(({ error }) => {
          if (error) {
            console.error("deleteProtocol:", error);
            // Revert on failure
            if (target) {
              setProtocols((prev) => [...prev, target].sort((a, b) => a.position - b.position));
            }
            toast.error("Failed to delete protocol");
          } else {
            queryClient.invalidateQueries({ queryKey: qk.protocols(userId) });
            queryClient.invalidateQueries({ queryKey: qk.checks(userId, monthKey) });
            toast.info(`Deleted ${target?.label || "protocol"}`);
          }
        });
    },
    [protocols, userId, monthKey, queryClient],
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
        queryClient.invalidateQueries({ queryKey: qk.note(userId, monthKey) });
      }, 700);
    },
    [userId, monthKey, queryClient],
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

  const gridTemplate = useMemo(
    () => `12rem repeat(${daysInMonth}, minmax(2.1rem, 1fr))`,
    [daysInMonth],
  );
  const isMobile = useIsMobile();

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
            className="print:hidden hidden md:inline-flex items-center gap-1.5 rounded-sm border border-foreground/15 bg-card px-2.5 py-1.5 font-mono text-xs text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            title="Print or export tracker sheet"
          >
            <Printer className="size-3.5" />
            <span className="hidden sm:inline">Print sheet</span>
          </button>
        </div>
      </div>

      {isMobile ? (
        <MobileTrackerView
          protocols={protocols}
          dates={dates}
          todayKey={todayKey}
          checks={checks}
          sleep={sleep}
          onToggle={toggleCheck}
          onSetSleep={setSleepDay}
          totalPoints={totalPoints}
          todayPoints={todayPoints}
          todayRate={todayRate}
          perfectDays={perfectDays}
          avgSleep={avgSleep}
          loading={loading}
          note={note}
          savingNote={savingNote}
          onSaveNote={saveNote}
          onAddProtocol={addProtocol}
          onDeleteProtocol={deleteProtocol}
          onRenameProtocol={renameProtocol}
        />
      ) : loading ? (
        <p className="py-24 text-center font-mono text-sm text-muted-foreground">
          Loading your dashboard…
        </p>
      ) : (
        <>
          {/* Protocols grid */}
          <div
            tabIndex={0}
            role="region"
            aria-label="Monthly habit protocols grid"
            className="overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
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
                  checkedDates={checks.get(p.id) ?? new Set()}
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
          <div
            tabIndex={0}
            role="region"
            aria-label="Monthly sleep log grid"
            className="mt-8 overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="min-w-max">
              <div
                className="grid border-b border-foreground/15"
                style={{ gridTemplateColumns: gridTemplate }}
              >
                <div className="border-r border-border/70 px-4 py-2 font-display text-sm font-bold">
                  Sleep
                </div>
                {dates.map((d, i) => {
                  const isActive = [...sleepByHour.values()].some((activeDates) => activeDates.has(d));
                  return (
                    <div
                      key={d}
                      className={`flex flex-col items-center justify-center border-r border-border/70 py-1 font-mono text-[10px] ${d === todayKey ? "grid-cell-today" : ""} ${isActive ? "bg-yellow-500 text-black" : ""}`}
                    >
                      <span className="font-semibold">{i + 1}</span>
                      <span className="text-muted-foreground">
                        {WEEKDAYS[new Date(view.y, view.m - 1, i + 1).getDay()]}
                      </span>
                      {isActive && <span aria-hidden="true">✓</span>}
                    </div>
                  );
                })}
              </div>
              {SLEEP_ROWS.map((hours) => (
                <SleepRow
                  key={hours}
                  hours={hours}
                  dates={dates}
                  todayKey={todayKey}
                  gridTemplate={gridTemplate}
                  activeDates={sleepByHour.get(hours) ?? new Set()}
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
