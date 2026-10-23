import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

export type Note = Database["public"]["Tables"]["notes"]["Row"];

const qk = {
  notes: () => ["notes"] as const,
};

export function useNotes(userId?: string) {
  return useQuery({
    queryKey: qk.notes(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notes")
        .select("*")
        .order("pinned", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Note[];
    },
    enabled: !!userId,
  });
}

export function useCreateNote(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (note: {
      title?: string;
      body?: string;
      source?: string;
      pinned?: boolean;
    }) => {
      const { data, error } = await supabase
        .from("notes")
        .insert({ user_id: userId, ...note })
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notes() });
      toast.success("Note created");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to create note");
    },
  });
}

type NoteChanges = Partial<Pick<Note, "title" | "body" | "source" | "pinned">>;

export function useUpdateNote(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...changes }: { id: string } & NoteChanges) => {
      const { data, error } = await supabase
        .from("notes")
        .update(changes)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notes() });
      toast.success("Note updated");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update note");
    },
  });
}

export function useDeleteNote(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("notes")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notes() });
      toast.success("Note deleted");
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to delete note");
    },
  });
}

export function useTogglePin(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const { data, error } = await supabase
        .from("notes")
        .update({ pinned })
        .eq("id", id)
        .eq("user_id", userId)
        .select()
        .single();
      if (error) throw error;
      return data as Note;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.notes() });
    },
    onError: (error: Error) => {
      toast.error(error.message ?? "Failed to update pin");
    },
  });
}