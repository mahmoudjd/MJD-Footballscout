import { ApiError } from "@/src/apiServices";
import { AuthSession } from "@/src/data/Types";

type RunAuthorizedRequestOptions<T> = {
  session: AuthSession | null;
  refreshSession: () => Promise<AuthSession | null>;
  request: (accessToken: string) => Promise<T>;
};

export async function runAuthorizedRequest<T>({
  session,
  refreshSession,
  request,
}: RunAuthorizedRequestOptions<T>): Promise<T> {
  if (!session?.accessToken) {
    throw new Error("Login required");
  }

  const shouldRefreshSoon = session.expiresAt <= Date.now() + 30_000;
  if (shouldRefreshSoon) {
    const refreshedSession = await refreshSession();
    if (refreshedSession?.accessToken) {
      return request(refreshedSession.accessToken);
    }
  }

  try {
    return await request(session.accessToken);
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      const refreshedSession = await refreshSession();
      if (refreshedSession?.accessToken) {
        return request(refreshedSession.accessToken);
      }
    }
    throw error;
  }
}
