-- User's daily protocols (habits) for the 1% better tracker
CREATE TABLE public.protocols (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  label TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocols TO authenticated;
GRANT ALL ON public.protocols TO service_role;
ALTER TABLE public.protocols ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own protocols"
  ON public.protocols FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Daily checkmarks: one row per protocol per day
CREATE TABLE public.protocol_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  protocol_id UUID NOT NULL REFERENCES public.protocols(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  done BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (protocol_id, entry_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.protocol_checks TO authenticated;
GRANT ALL ON public.protocol_checks TO service_role;
ALTER TABLE public.protocol_checks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own checks"
  ON public.protocol_checks FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Sleep hours logged per day
CREATE TABLE public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  entry_date DATE NOT NULL,
  hours NUMERIC(3,1) NOT NULL,
  UNIQUE (user_id, entry_date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.sleep_logs TO authenticated;
GRANT ALL ON public.sleep_logs TO service_role;
ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sleep logs"
  ON public.sleep_logs FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Free-form note per month
CREATE TABLE public.month_notes (
  user_id UUID NOT NULL,
  month_key TEXT NOT NULL,
  note TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, month_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.month_notes TO authenticated;
GRANT ALL ON public.month_notes TO service_role;
ALTER TABLE public.month_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own month notes"
  ON public.month_notes FOR ALL
  TO authenticated
  USING (user_id = (SELECT auth.uid()))
  WITH CHECK (user_id = (SELECT auth.uid()));

-- Indexes for the monthly range scans
CREATE INDEX idx_protocols_user ON public.protocols (user_id, position);
CREATE INDEX idx_checks_user_date ON public.protocol_checks (user_id, entry_date);
CREATE INDEX idx_sleep_user_date ON public.sleep_logs (user_id, entry_date);