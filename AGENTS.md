<!-- LOVABLE:BEGIN -->

> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

<!-- LOVABLE:END -->

## Architecture decisions

- All tracker data access is client-side through the generated Supabase client with RLS
  (`user_id = auth.uid()`); no server functions for tracker CRUD — keeps the grid fast and
  authorization enforced by the database.
- Data model: `public.protocols`, `public.protocol_checks`, `public.sleep_logs`,
  `public.month_notes`; days are keyed by `entry_date` (YYYY-MM-DD), months by `month_key`
  (YYYY-MM).
