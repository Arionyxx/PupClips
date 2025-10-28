import { getUser, getSession } from "@/lib/supabase/session";

export default async function AuthDebugPage() {
  const user = await getUser();
  const session = await getSession();

  return (
    <main className="bg-background flex min-h-screen flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Authentication Debug
          </h1>
          <p className="text-muted-foreground">
            This page displays the current authentication state
          </p>
        </div>

        <div className="border-border space-y-4 rounded-lg border p-6">
          <div>
            <h2 className="text-xl font-semibold">User Status</h2>
            {user ? (
              <div className="mt-4 space-y-2">
                <p className="font-medium text-green-600">✅ Authenticated</p>
                <div className="bg-muted space-y-1 rounded p-4">
                  <p>
                    <strong>Email:</strong> {user.email}
                  </p>
                  <p>
                    <strong>User ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {new Date(user.created_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="font-medium text-amber-600">
                  ⚠️ Not authenticated
                </p>
                <p className="text-muted-foreground mt-2 text-sm">
                  You need to sign in to see user information.
                </p>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-xl font-semibold">Session Details</h2>
            {session ? (
              <div className="mt-4 space-y-2">
                <div className="bg-muted space-y-1 overflow-auto rounded p-4 font-mono text-sm">
                  <p>
                    <strong>Access Token:</strong>{" "}
                    {session.access_token.substring(0, 20)}...
                  </p>
                  <p>
                    <strong>Expires:</strong>{" "}
                    {new Date(session.expires_at! * 1000).toLocaleString()}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-muted-foreground text-sm">
                  No active session
                </p>
              </div>
            )}
          </div>

          <div className="border-border border-t pt-4">
            <p className="text-muted-foreground text-sm">
              This page uses server-side session helpers to fetch the
              authenticated user. Session state is automatically maintained
              across navigation by the middleware.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
