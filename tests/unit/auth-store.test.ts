/**
 * tests/unit/auth-store.test.ts
 * Tests the Zustand auth store in isolation
 */
import { act } from "@testing-library/react";
import { useAuthStore } from "@/store/auth-store";

// Mock the auth API
jest.mock("@/lib/api/auth", () => ({
  authApi: {
    login: jest.fn(),
    register: jest.fn(),
    persistTokens: jest.fn(),
    logout: jest.fn(),
  },
}));

// Mock tokenStore
jest.mock("@/lib/api/client", () => ({
  tokenStore: {
    getAccess: jest.fn().mockReturnValue(null),
    setAccess: jest.fn(),
    getRefresh: jest.fn().mockReturnValue(null),
    setRefresh: jest.fn(),
    clear: jest.fn(),
  },
}));

describe("useAuthStore", () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  });

  it("starts unauthenticated", () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.user).toBeNull();
  });

  it("clears error when clearError is called", () => {
    useAuthStore.setState({ error: "some error" });
    act(() => { useAuthStore.getState().clearError(); });
    expect(useAuthStore.getState().error).toBeNull();
  });

  it("sets loading state during login", async () => {
    const { authApi } = require("@/lib/api/auth");

    // Create a promise that won't resolve immediately
    let resolve!: (value: any) => void;
    const pending = new Promise((r) => { resolve = r; });
    authApi.login.mockReturnValue(pending);

    const loginPromise = act(async () => {
      useAuthStore.getState().login({ email: "test@test.com", password: "password" }).catch(() => {});
    });

    // Before resolution — should be loading
    expect(useAuthStore.getState().isLoading).toBe(true);
  });

  it("logout clears authentication", () => {
    useAuthStore.setState({ user: { id: "1", email: "a@b.com", username: "a", is_active: true }, isAuthenticated: true });
    act(() => { useAuthStore.getState().logout(); });
    expect(useAuthStore.getState().isAuthenticated).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
  });
});
