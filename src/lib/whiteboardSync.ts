export type WhiteboardCloudState = {
  tabs: any[];
  activeTabId: string;
  savedDrafts?: any[];
  trashedTabs?: any[];
  updatedAt: number;
};

/**
 * Loads the logged-in user's whiteboard state from Cloudflare R2 ($0 egress).
 * Returns null if R2 is not configured or no cloud snapshot exists yet.
 */
export async function loadWhiteboardFromCloud(userId: string): Promise<WhiteboardCloudState | null> {
  if (!userId) return null;
  try {
    const key = `whiteboard/${encodeURIComponent(userId)}.json`;
    const res = await fetch(`/api/r2-presign?key=${encodeURIComponent(key)}`);
    if (!res.ok) return null;
    const info = await res.json().catch(() => null);
    if (!info?.ok || !info?.publicUrl) return null;

    const dataRes = await fetch(`${info.publicUrl}?t=${Date.now()}`, { cache: "no-store" });
    if (!dataRes.ok) return null;
    const parsed = await dataRes.json().catch(() => null);
    if (!parsed || !Array.isArray(parsed.tabs) || parsed.tabs.length === 0) return null;
    return parsed as WhiteboardCloudState;
  } catch {
    return null;
  }
}

/**
 * Saves the logged-in user's whiteboard state to Cloudflare R2 ($0 egress).
 */
export async function saveWhiteboardToCloud(
  userId: string,
  state: WhiteboardCloudState
): Promise<boolean> {
  if (!userId) return false;
  try {
    const key = `whiteboard/${encodeURIComponent(userId)}.json`;
    const res = await fetch("/api/r2-presign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key,
        contentType: "application/json",
      }),
    });
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    if (!data?.ok || !data?.uploadUrl) return false;

    const putRes = await fetch(data.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(state),
    });
    return putRes.ok;
  } catch {
    return false;
  }
}
