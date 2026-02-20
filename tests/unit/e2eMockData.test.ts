import { afterEach, describe, expect, it } from "vitest";
import {
  createE2EMockUser,
  isE2EMockModeEnabled,
} from "@/firebase/services/e2eMockData";

const ORIGINAL_ENV_FLAG = process.env.NEXT_PUBLIC_E2E_MOCK_DATA;

afterEach(() => {
  process.env.NEXT_PUBLIC_E2E_MOCK_DATA = ORIGINAL_ENV_FLAG;
  delete (globalThis as { window?: Window }).window;
});

describe("e2e mock data service", () => {
  it("enables mock mode when NEXT_PUBLIC_E2E_MOCK_DATA is set", () => {
    process.env.NEXT_PUBLIC_E2E_MOCK_DATA = "1";
    expect(isE2EMockModeEnabled()).toBe(true);
  });

  it("enables mock mode from localStorage marker in browser context", () => {
    process.env.NEXT_PUBLIC_E2E_MOCK_DATA = "0";
    const storage = new Map<string, string>();
    storage.set("consumption.e2e.mock-data", "1");

    (globalThis as { window?: Window }).window = {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    } as unknown as Window;

    expect(isE2EMockModeEnabled()).toBe(true);
  });

  it("returns false without env flag and without browser context", () => {
    process.env.NEXT_PUBLIC_E2E_MOCK_DATA = "0";
    expect(isE2EMockModeEnabled()).toBe(false);
  });

  it("uses persisted defaultCar from auth session when available", () => {
    process.env.NEXT_PUBLIC_E2E_MOCK_DATA = "0";
    const storage = new Map<string, string>();
    storage.set(
      "consumption.auth.session",
      JSON.stringify({ defaultCar: "BMW" }),
    );

    (globalThis as { window?: Window }).window = {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    } as unknown as Window;

    const user = createE2EMockUser("u-1");
    expect(user.defaultCar).toBe("BMW");
  });

  it("falls back to Zoe for missing or invalid persisted defaultCar", () => {
    process.env.NEXT_PUBLIC_E2E_MOCK_DATA = "0";
    const storage = new Map<string, string>();
    storage.set("consumption.auth.session", "not-json");

    (globalThis as { window?: Window }).window = {
      localStorage: {
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value);
        },
      },
    } as unknown as Window;

    const user = createE2EMockUser("u-2");
    expect(user.defaultCar).toBe("Zoe");
  });
});
