import { describe, expect, it } from "vitest";
import { Role } from "@/constants/enums";
import { User } from "@/common/models";
import {
  AUTH_SESSION_STORAGE_KEY,
  AUTH_SESSION_TTL_MS,
} from "@/utils/authentication/core/targetState";
import {
  buildPersistedAuthSession,
  clearPersistedAuthSession,
  persistAuthSession,
  readPersistedAuthSession,
  StorageLike,
} from "@/utils/authentication/session/sessionStorage";

const createMemoryStorage = (): StorageLike => {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
  };
};

describe("authSessionStorage", () => {
  it("builds a persisted auth session from a valid user", () => {
    const user: User = {
      key: "1234",
      role: Role.Admin,
      defaultCar: "Zoe",
    };
    const now = 1_700_000_000_000;

    const session = buildPersistedAuthSession(user, now);

    expect(session).toEqual({
      schemaVersion: 1,
      userId: "1234",
      role: Role.Admin,
      defaultCar: "Zoe",
      expiresAt: now + AUTH_SESSION_TTL_MS,
    });
  });

  it("returns null when required user fields are missing", () => {
    const missingKey: User = { role: Role.User, defaultCar: "BMW" };
    const missingRole: User = { key: "1111", defaultCar: "BMW" };
    const missingDefaultCar: User = { key: "1111", role: Role.User };

    expect(buildPersistedAuthSession(missingKey)).toBeNull();
    expect(buildPersistedAuthSession(missingRole)).toBeNull();
    expect(buildPersistedAuthSession(missingDefaultCar)).toBeNull();
  });

  it("persists and reads session in storage", () => {
    const storage = createMemoryStorage();
    const session = {
      schemaVersion: 1,
      userId: "7777",
      role: Role.User,
      defaultCar: "BMW",
      expiresAt: 1_900_000_000_000,
    };

    const persisted = persistAuthSession({ session, storage });
    const loaded = readPersistedAuthSession(storage);

    expect(persisted).toBe(true);
    expect(loaded).toEqual(session);
  });

  it("returns null when stored json is invalid", () => {
    const storage = createMemoryStorage();
    storage.setItem(AUTH_SESSION_STORAGE_KEY, "{broken_json");

    const loaded = readPersistedAuthSession(storage);

    expect(loaded).toBeNull();
  });

  it("clears persisted session from storage", () => {
    const storage = createMemoryStorage();
    storage.setItem(AUTH_SESSION_STORAGE_KEY, '{"a":1}');

    const cleared = clearPersistedAuthSession(storage);
    const loaded = readPersistedAuthSession(storage);

    expect(cleared).toBe(true);
    expect(loaded).toBeNull();
  });
});




