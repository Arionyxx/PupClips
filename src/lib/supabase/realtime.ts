import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { createClient } from "./browser-client";

type Tables = Database["public"]["Tables"];
type TableName = keyof Tables;

export interface RealtimeSubscriptionOptions<T extends TableName> {
  table: T;
  event: "INSERT" | "UPDATE" | "DELETE" | "*";
  schema?: string;
  filter?: string;
  onEvent: (payload: RealtimePostgresChangesPayload<Tables[T]["Row"]>) => void;
  onError?: (error: Error) => void;
}

export function createRealtimeSubscription<T extends TableName>({
  table,
  event,
  schema = "public",
  filter,
  onEvent,
  onError,
}: RealtimeSubscriptionOptions<T>): RealtimeChannel {
  const supabase = createClient();

  const channel = supabase.channel(`${schema}:${table}`);

  // Subscribe to postgres changes
  // Type workaround for Supabase Realtime API
  /* eslint-disable @typescript-eslint/no-explicit-any */
  channel
    .on(
      "postgres_changes" as any,
      {
        event,
        schema,
        table,
        ...(filter && { filter }),
      } as any,
      (payload: any) => {
        onEvent(payload as RealtimePostgresChangesPayload<Tables[T]["Row"]>);
      }
    )
    .subscribe((status, err) => {
      if (err && onError) {
        onError(err);
      }
    });
  /* eslint-enable @typescript-eslint/no-explicit-any */

  return channel;
}

export function unsubscribeRealtimeChannel(channel: RealtimeChannel) {
  const supabase = createClient();
  supabase.removeChannel(channel);
}

// TODO: Add more specialized realtime helpers for specific features:
// - subscribeToVideoLikes(videoId: string, callback)
// - subscribeToVideoComments(videoId: string, callback)
// - subscribeToUserNotifications(userId: string, callback)
