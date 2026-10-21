import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Protocol = { id: string; label: string; position: number };

const pad = (n: number) => String(n).padStart(2, "0");
const dateKey = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;
const WEEKDAYS = ["Su", "M", "T", "W", "Th", "F", "Sa"];
const SLEEP_ROWS = [9, 8, 7, 6, 5];
const SEED_COUNT = 12;

export function TrackerBoard({ userId }: { userId: string }) {
  const now = new Date();
  const [view, setView] = useState({ y: now.getFullYear(), m: now.getMonth() + 1 });
  const [protocols, setProtocols] = useState<Protocol[]>([]);
  const [checks, setChecks] = useState<Set<string>>(new Set());
  const [sleep, setSleep] = useState<Map<string, number>>(new Map());
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const noteTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const monthKey = `${view.y}-${pad(view.m)}`;
  const daysInMonth = useMemo(() => new Date(view.y, view.m, 0).getDate(), [view]);
  const dates = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => dateKey(view.y, view.m, i + 1)),
    [view, daysInMonth],
  );
  const todayKey = dateKey(now.getFullYear(), now.getMonth() + 1, now.getDate());

  const monthLabel = new Date(view.y, view.m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.y, v.m - 1 + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() + 1 };
    });
  }

  // Load (or seed) all data for the visible month
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    (async () => {
      const start = dateKey(view.y, view.m, 1);
      const end = dateKey(view.y, view.m, daysInMonth);

      const [protoRes, checkRes, sleepRes, noteRes] = await Promise.all([
        supabase.from("protocols").select("id,label,position").eq("user_id", userId).order("position"),
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

      // First visit: lay out 12 numbered protocol rows, like the paper sheet
      if (!protoRes.error && protoList.length === 0) {
        const seed = Array.from({ length: SEED_COUNT }, (_, i) => ({
          user_id: userId,
          label: `Protocol ${i + 1}`,
          position: i,
        }));
        const ins = await supabase.from("protocols").insert(seed).select("id,label,position");
        if (!ins.error && ins.data) protoList = ins.data as Protocol[];
      }

      if (cancelled) return;
      setProtocols(protoList);
      setChecks(
        new Set((checkRes.data ?? []).map((r: { protocol_id: string; entry_date: string }) => `${r.protocol_id}|${r.entry_date}`)),
      );
      setSleep(new Map((sleepRes.data ?? []).map((r: { entry_date: string; hours: number }) => [r.entry_date, Number(r.hours)])));
      setNote(noteRes.data?.note ?? "");
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId, monthKey, daysInMonth, view.y, view.m]);

  function toggleCheck(protocolId: string, date: string) {
    const key = `${protocolId}|${date}`;
    const has = checks.has(key);
    setChecks((prev) => {
      const next = new Set(prev);
      if (has) next.delete(key);
      else next.add(key);
      return next;
    });
    if (has) {
      supabase.from("protocol_checks").delete().eq("protocol_id", protocolId).eq("entry_date", date);
    } else {
      supabase
        .from("protocol_checks")
        .upsert({ user_id: userId, protocol_id: protocolId, entry_date: date, done: true }, { onConflict: "protocol_id,entry_date" });
    }
  }

  function setSleepDay(date: string, hours: number) {
    const current = sleep.get(date);
    const same = current === hours;
    setSleep((prev) => {
      const next = new Map(prev);
      if (same) next.delete(date);
      else next.set(date, hours);
      return next;
    });
    if (same) {
      supabase.from("sleep_logs").delete().eq("user_id", userId).eq("entry_date", date);
    } else {
      supabase.from("sleep_logs").upsert({ user_id: userId, entry_date: date, hours }, { onConflict: "user_id,entry_date" });
    }
  }

  function renameProtocol(id: string, label: string) {
    const row = protocols.find((p) => p.id === id);
    if (!row || row.label === label) return;
    setProtocols((prev) => prev.map((p) => (p.id === id ? { ...p, label } : p)));
    supabase.from("protocols").update({ label }).eq("id", id);
  }

  async function addProtocol() {
    const label = `Protocol ${protocols.length + 1}`;
    const { data, error } = await supabase
      .from("protocols")
      .insert({ user_id: userId, label, position: protocols.length })
      .select("id,label,position");
    if (!error && data) setProtocols((prev) => [...prev, ...(data as Protocol[])]);
  }

  function deleteProtocol(id: string) {
    setProtocols((prev) => prev.filter((p) => p.id !== id));
    setChecks((prev) => new Set([...prev].filter((k) => !k.startsWith(`${id}|`))));
    supabase.from("protocols").delete().eq("id", id);
  }

  function saveNote(value: string) {
    setNote(value);
    clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(() => {
      supabase
        .from("month_notes")
        .upsert({ user_id: userId, month_key: monthKey, note: value, updated_at: new Date().toISOString() }, { onConflict: "user_id,month_key" });
    }, 700);
  }

  const totalPoints = checks.size;
  const perfectDays = protocols.length
    ? dates.filter((d) => protocols.every((p) => checks.has(`${p.id}|${d}`))).length
    : 0;
  const sleepValues = [...sleep.values()];
  const avgSleep = sleepValues.length
    ? (sleepValues.reduce((a, b) => a + b, 0) / sleepValues.length).toFixed(1)
    : null;

  const gridTemplate = `11rem repeat(${daysInMonth}, minmax(2.1rem, 1fr))`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Month navigation */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="grid size-9 place-items-center rounded-sm border border-foreground/15 bg-card transition-colors hover:bg-secondary"
          >
            ‹
          </button>
          <h2 className="min-w-44 text-center font-display text-2xl font-black italic tracking-tight">{monthLabel}</h2>
          <button
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="grid size-9 place-items-center rounded-sm border border-foreground/15 bg-card transition-colors hover:bg-secondary"
          >
            ›
          </button>
        </div>
        <dl className="flex gap-6 font-mono text-xs">
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Total points</dt>
            <dd className="text-xl font-semibold text-primary">{loading ? "–" : totalPoints}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Perfect days</dt>
            <dd className="text-xl font-semibold">{loading ? "–" : perfectDays}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">Avg sleep</dt>
            <dd className="text-xl font-semibold">{loading ? "–" : avgSleep ? `${avgSleep}h` : "–"}</dd>
          </div>
        </dl>
      </div>

      {loading ? (
        <p className="py-24 text-center font-mono text-sm text-muted-foreground">Loading your dashboard…</p>
      ) : (
        <>
          {/* Protocols grid */}
          <div className="overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm">
            <div className="min-w-max">
              <div className="grid border-b border-foreground/15" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="flex items-center justify-between border-r border-border/70 px-4 py-2 font-display text-sm font-bold">
                  Protocols
                  <button
                    onClick={addProtocol}
                    className="rounded-sm border border-foreground/15 px-2 py-0.5 font-mono text-[10px] font-normal uppercase tracking-wider text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
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
                    <span className="text-muted-foreground">{WEEKDAYS[new Date(view.y, view.m - 1, i + 1).getDay()]}</span>
                  </div>
                ))}
              </div>

              {protocols.map((p) => (
                <div key={p.id} className="group grid border-b border-border/70 last:border-b-0" style={{ gridTemplateColumns: gridTemplate }}>
                  <div className="flex items-center gap-1 border-r border-border/70 px-2 pl-4">
                    <input
                      value={p.label}
                      onChange={(e) => setProtocols((prev) => prev.map((q) => (q.id === p.id ? { ...q, label: e.target.value } : q)))}
                      onBlur={(e) => renameProtocol(p.id, e.target.value)}
                      aria-label="Protocol name"
                      className="w-full rounded-sm bg-transparent px-1 py-1 text-sm outline-none focus:bg-secondary/70"
                    />
                    <button
                      onClick={() => deleteProtocol(p.id)}
                      aria-label={`Delete ${p.label}`}
                      className="opacity-0 transition-opacity group-hover:opacity-100 grid size-6 shrink-0 place-items-center rounded-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                  {dates.map((d) => {
                    const checked = checks.has(`${p.id}|${d}`);
                    return (
                      <button
                        key={d}
                        onClick={() => toggleCheck(p.id, d)}
                        aria-label={`${p.label} on ${d}`}
                        aria-pressed={checked}
                        className={`grid-cell ${checked ? "grid-cell-checked" : ""} ${d === todayKey ? "grid-cell-today" : ""}`}
                      >
                        {checked ? "✓" : ""}
                      </button>
                    );
                  })}
                </div>
              ))}

              {/* Total points row */}
              <div className="grid bg-muted/60" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="border-r border-border/70 px-4 py-2 font-display text-sm font-bold">Total Points</div>
                {dates.map((d) => (
                  <div
                    key={d}
                    className={`grid-cell cursor-default border-b-0 border-l-0 ${d === todayKey ? "grid-cell-today" : ""}`}
                  >
                    {protocols.filter((p) => checks.has(`${p.id}|${d}`)).length}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sleep grid */}
          <div className="mt-8 overflow-x-auto rounded-lg border border-foreground/15 bg-card shadow-sm">
            <div className="min-w-max">
              <div className="grid border-b border-foreground/15" style={{ gridTemplateColumns: gridTemplate }}>
                <div className="border-r border-border/70 px-4 py-2 font-display text-sm font-bold">Sleep</div>
                {dates.map((d, i) => (
                  <div
                    key={d}
                    className={`flex flex-col items-center justify-center border-r border-border/70 py-1 font-mono text-[10px] ${d === todayKey ? "grid-cell-today" : ""}`}
                  >
                    <span className="font-semibold">{i + 1}</span>
                    <span className="text-muted-foreground">{WEEKDAYS[new Date(view.y, view.m - 1, i + 1).getDay()]}</span>
                  </div>
                ))}
              </div>
              {SLEEP_ROWS.map((hours) => (
                <div key={hours} className="grid border-b border-border/70 last:border-b-0" style={{ gridTemplateColumns: gridTemplate }}>
                  <div className="flex items-center border-r border-border/70 px-4 font-mono text-xs text-muted-foreground">
                    {hours}hrs
                  </div>
                  {dates.map((d) => {
                    const active = sleep.get(d) === hours;
                    return (
                      <button
                        key={d}
                        onClick={() => setSleepDay(d, hours)}
                        aria-label={`${hours} hours of sleep on ${d}`}
                        aria-pressed={active}
                        className={`grid-cell ${active ? "grid-cell-sleep" : ""} ${d === todayKey ? "grid-cell-today" : ""}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Monthly note */}
          <div className="mt-8 rounded-lg border border-foreground/15 bg-card p-4 shadow-sm">
            <label htmlFor="month-note" className="mb-2 block font-display text-sm font-bold">
              Note
            </label>
            <textarea
              id="month-note"
              value={note}
              onChange={(e) => saveNote(e.target.value)}
              rows={3}
              placeholder="What worked this month? What will you adjust?"
              className="w-full resize-y rounded-sm border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">Saved automatically</p>
          </div>
        </>
      )}
    </div>
  );
}
