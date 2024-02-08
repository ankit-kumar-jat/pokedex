import type BetterSqlite3 from "better-sqlite3";
import Database from "better-sqlite3";
import {
  cachified as baseCachified,
  lruCacheAdapter,
  verboseReporter,
  type CacheEntry,
  type Cache as CachifiedCache,
  type CachifiedOptions,
} from "@epic-web/cachified";
import { LRUCache } from "lru-cache";
import fs from "fs";
import { singleton } from "./singleton.server";
import { type Timings, time } from "./timing.server";

const CACHE_DATABASE_PATH = "cache.db";

const cacheDb = singleton("cacheDb", createDatabase);

function createDatabase(tryAgain = true): BetterSqlite3.Database {
  const db = new Database(CACHE_DATABASE_PATH);
  try {
    // create cache table with metadata JSON column and value JSON column if it does not exist already
    db.exec(`
        CREATE TABLE IF NOT EXISTS cache (
          key TEXT PRIMARY KEY,
          metadata TEXT,
          value TEXT
        )
      `);
  } catch (error: unknown) {
    fs.unlinkSync(CACHE_DATABASE_PATH);
    if (tryAgain) {
      console.error(
        `Error creating cache database, deleting the file at "${CACHE_DATABASE_PATH}" and trying again...`
      );
      return createDatabase(false);
    }
    throw error;
  }
  return db;
}

const lru = singleton(
  "lru-cache",
  () => new LRUCache<string, CacheEntry<unknown>>({ max: 5000 })
);
export const lruCache = lruCacheAdapter(lru);

export const cache: CachifiedCache = {
  name: "SQLite cache",
  get(key) {
    const result = cacheDb
      .prepare("SELECT value, metadata FROM cache WHERE key = ?")
      .get(key) as any;
    if (!result) return null;
    return {
      metadata: JSON.parse(result.metadata),
      value: JSON.parse(result.value),
    };
  },
  async set(key, entry) {
    cacheDb
      .prepare(
        "INSERT OR REPLACE INTO cache (key, value, metadata) VALUES (@key, @value, @metadata)"
      )
      .run({
        key,
        value: JSON.stringify(entry.value),
        metadata: JSON.stringify(entry.metadata),
      });
  },
  async delete(key) {
    cacheDb.prepare("DELETE FROM cache WHERE key = ?").run(key);
  },
};

export async function getAllCacheKeys(limit: number) {
  return {
    sqlite: cacheDb
      .prepare("SELECT key FROM cache LIMIT ?")
      .all(limit)
      .map((row) => (row as { key: string }).key),
    lru: [...lru.keys()],
  };
}

export async function searchCacheKeys(search: string, limit: number) {
  return {
    sqlite: cacheDb
      .prepare("SELECT key FROM cache WHERE key LIKE ? LIMIT ?")
      .all(`%${search}%`, limit)
      .map((row) => (row as { key: string }).key),
    lru: [...lru.keys()].filter((key) => key.includes(search)),
  };
}

export async function cachified<Value>({
  timings,
  ...options
}: CachifiedOptions<Value> & {
  timings?: Timings;
}): Promise<Value> {
  let cachifiedResolved = false;
  const cachifiedPromise = baseCachified({
    reporter: verboseReporter(),
    ...options,
    getFreshValue: async (context) => {
      // if we've already retrieved the cached value, then this may be called
      // after the response has already been sent so there's no point in timing
      // how long this is going to take
      if (!cachifiedResolved && timings) {
        return time(() => options.getFreshValue(context), {
          timings,
          type: `getFreshValue:${options.key}`,
          desc: `request forced to wait for a fresh ${options.key} value`,
        });
      }
      return options.getFreshValue(context);
    },
  });
  const result = await time(cachifiedPromise, {
    timings,
    type: `cache:${options.key}`,
    desc: `${options.key} cache retrieval`,
  });
  cachifiedResolved = true;
  return result;
}

export function generateCacheKey(
  ...args: (string | number | boolean | object | any[] | undefined | null)[]
): string {
  function processArgument(arg: any): string {
    if (Array.isArray(arg)) {
      return arg.map(processArgument).join(":");
    } else if (typeof arg === "object" && arg !== null) {
      return Object.entries(arg)
        .map(([key, value]) => `${key}:${processArgument(value)}`)
        .join("::");
    } else {
      return String(arg);
    }
  }

  return args
    .filter((arg) => arg !== undefined && arg !== null)
    .map(processArgument)
    .join("::");
}
