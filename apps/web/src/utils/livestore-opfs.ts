import { shouldNeverHappen } from "./should-never-happen";

const MAX_ATTEMPTS = 3;
const INITIAL_DELAY_MS = 100;

const OPFS_ERROR = {
  NotFound: "NotFoundError",
  InUse: "InvalidStateError",
  NoModificationAllowed: "NoModificationAllowedError",
} as const;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function removeOpfsDirectory(root: FileSystemDirectoryHandle, name: string): Promise<void> {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      await root.removeEntry(name, { recursive: true });
      return;
    } catch (error) {
      const errorName = (error as Error).name;

      if (errorName === OPFS_ERROR.NotFound) return;

      const isRetryable =
        errorName === OPFS_ERROR.InUse || errorName === OPFS_ERROR.NoModificationAllowed;
      if (isRetryable && attempt < MAX_ATTEMPTS) {
        // Reason: 使用指数退避策略，避免频繁重试
        await delay(INITIAL_DELAY_MS * Math.pow(2, attempt - 1));
        continue;
      }

      throw shouldNeverHappen(`未知错误: ${errorName}`);
    }
  }
}

export async function hasLiveStoreData(storeId: string): Promise<boolean> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) return false;

  const root = await navigator.storage.getDirectory();
  const prefix = `livestore-${storeId}@`;

  for await (const name of root.keys()) {
    if (name.startsWith(prefix)) {
      return true;
    }
  }

  return false;
}

export async function purgeLiveStoreOpfsByStoreId(storeId: string): Promise<void> {
  if (typeof navigator === "undefined" || !("storage" in navigator)) return;

  const root = await navigator.storage.getDirectory();
  const prefix = `livestore-${storeId}@`;

  for await (const name of root.keys()) {
    if (name.startsWith(prefix)) {
      await removeOpfsDirectory(root, name);
    }
  }
}
