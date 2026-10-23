import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

/**
 * Permanently delete the authenticated user's account.
 *
 * Flow:
 *  1. Read the Authorization header (attached by `attachSupabaseAuth` middleware).
 *  2. Verify the JWT via `supabaseAdmin.auth.getUser(token)` — confirms the
 *     caller really owns this session.
 *  3. Delete all application data from tracker tables (admin client bypasses RLS).
 *  4. Delete the auth user from `auth.users` so they cannot log in again.
 *
 * This MUST run server-side because it uses the service-role key.
 */
export const deleteAccount = createServerFn({ method: "POST" }).handler(
  async () => {
    // Lazy-import the admin client so the service-role key never leaks to
    // the client bundle (this file is tree-shaken to a server-only chunk).
    const { supabaseAdmin } = await import(
      "@/integrations/supabase/client.server"
    );

    // 1. Extract the caller's JWT from the Authorization header
    const authHeader = getRequestHeader("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("Unauthorized: missing or invalid Authorization header");
    }
    const token = authHeader.replace("Bearer ", "");

    // 2. Verify the token and extract the user ID
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      throw new Error(
        `Unauthorized: ${authError?.message ?? "invalid session"}`,
      );
    }
    const userId = user.id;

    // 3. Delete application data (admin client — bypasses RLS)
    //    Delete in dependency order: checks reference protocols
    const tableDeletes = await Promise.all([
      supabaseAdmin
        .from("protocol_checks")
        .delete()
        .eq("user_id", userId),
      supabaseAdmin.from("sleep_logs").delete().eq("user_id", userId),
      supabaseAdmin.from("month_notes").delete().eq("user_id", userId),
      supabaseAdmin.from("notes").delete().eq("user_id", userId),
    ]);

    // Check for data deletion errors
    for (const result of tableDeletes) {
      if (result.error) {
        console.error("Data deletion error:", result.error);
        throw new Error(
          `Failed to delete user data: ${result.error.message}`,
        );
      }
    }

    // Delete protocols after checks (foreign-key dependency)
    const protocolsResult = await supabaseAdmin
      .from("protocols")
      .delete()
      .eq("user_id", userId);
    if (protocolsResult.error) {
      console.error("Protocols deletion error:", protocolsResult.error);
      throw new Error(
        `Failed to delete protocols: ${protocolsResult.error.message}`,
      );
    }

    // 4. Delete the auth user from auth.users — prevents future login
    const { error: deleteError } =
      await supabaseAdmin.auth.admin.deleteUser(userId);
    if (deleteError) {
      console.error("Auth user deletion error:", deleteError);
      throw new Error(
        `Failed to delete auth account: ${deleteError.message}`,
      );
    }

    return { success: true };
  },
);