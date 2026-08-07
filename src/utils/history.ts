import { SERPSnapshot } from '../types';

const STORAGE_KEY = 'serp_intelligence_history_v1';
const MAX_HISTORY_ITEMS = 50;

/**
 * Retrieves all saved SERP snapshots from localStorage
 */
export function getAllHistorySnapshots(): SERPSnapshot[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    
    // Ensure properly sorted descending by capturedAt
    return parsed.sort((a, b) => new Date(b.capturedAt).getTime() - new Date(a.capturedAt).getTime());
  } catch (err) {
    console.error('Failed to read SERP history from localStorage:', err);
    return [];
  }
}

/**
 * Saves a SERP snapshot to localStorage history
 */
export function saveSnapshotToHistory(snapshot: SERPSnapshot): SERPSnapshot[] {
  if (!snapshot || !snapshot.keyword || !snapshot.capturedAt) return getAllHistorySnapshots();

  try {
    const history = getAllHistorySnapshots();

    // Check if exact same snapshot already exists (by capturedAt or keyword + capturedAt)
    const existingIndex = history.findIndex(
      item => item.capturedAt === snapshot.capturedAt && item.keyword.toLowerCase() === snapshot.keyword.toLowerCase()
    );

    let updated: SERPSnapshot[];
    if (existingIndex >= 0) {
      updated = [...history];
      updated[existingIndex] = snapshot;
    } else {
      updated = [snapshot, ...history];
    }

    // Limit to max items
    if (updated.length > MAX_HISTORY_ITEMS) {
      updated = updated.slice(0, MAX_HISTORY_ITEMS);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('Failed to save SERP snapshot to history:', err);
    return getAllHistorySnapshots();
  }
}

/**
 * Returns history snapshots for a specific keyword
 */
export function getHistoryForKeyword(keyword: string): SERPSnapshot[] {
  if (!keyword) return [];
  const normalizedKey = keyword.trim().toLowerCase();
  const all = getAllHistorySnapshots();
  return all.filter(s => s.keyword.trim().toLowerCase() === normalizedKey);
}

/**
 * Returns the latest prior snapshot for comparison for a given current snapshot
 */
export function getPriorSnapshotForKeyword(currentSnapshot: SERPSnapshot): SERPSnapshot | null {
  const history = getHistoryForKeyword(currentSnapshot.keyword);
  const currentTime = new Date(currentSnapshot.capturedAt).getTime();

  // Find snapshots taken before the current snapshot
  const priorSnapshots = history.filter(s => {
    const t = new Date(s.capturedAt).getTime();
    // Prior means captured at least 5 seconds earlier or different timestamp
    return t < currentTime - 1000;
  });

  if (priorSnapshots.length > 0) {
    return priorSnapshots[0]; // Most recent prior snapshot
  }

  // If no prior snapshot for exact keyword, look for any recent prior snapshot as fallback
  const anyPrior = getAllHistorySnapshots().filter(s => {
    const t = new Date(s.capturedAt).getTime();
    return t < currentTime - 1000 && s.keyword.toLowerCase() !== currentSnapshot.keyword.toLowerCase();
  });

  return anyPrior.length > 0 ? anyPrior[0] : null;
}

/**
 * Deletes a snapshot by its timestamp
 */
export function deleteSnapshotFromHistory(capturedAt: string): SERPSnapshot[] {
  try {
    const all = getAllHistorySnapshots();
    const filtered = all.filter(s => s.capturedAt !== capturedAt);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Failed to delete snapshot from history:', err);
    return getAllHistorySnapshots();
  }
}

/**
 * Clears all snapshot history
 */
export function clearAllHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear SERP history:', err);
  }
}
