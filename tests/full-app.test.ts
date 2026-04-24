import { describe, it, expect } from "vitest";

// ============================================================
// Module System Tests
// ============================================================
describe("Module System", () => {
  it("should have exactly 25 modules", async () => {
    const { MODULES } = await import("../lib/modules-context");
    expect(MODULES).toHaveLength(25);
  });

  it("all modules should have RUNNING status", async () => {
    const { MODULES } = await import("../lib/modules-context");
    const running = MODULES.filter((m) => m.status === "RUNNING");
    expect(running).toHaveLength(25);
  });

  it("all modules should have unique IDs", async () => {
    const { MODULES } = await import("../lib/modules-context");
    const ids = MODULES.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(25);
  });

  it("all modules should have tools array", async () => {
    const { MODULES } = await import("../lib/modules-context");
    MODULES.forEach((m) => {
      expect(Array.isArray(m.tools)).toBe(true);
      expect(m.tools.length).toBeGreaterThan(0);
    });
  });

  it("all modules should have commands array", async () => {
    const { MODULES } = await import("../lib/modules-context");
    MODULES.forEach((m) => {
      expect(Array.isArray(m.commands)).toBe(true);
      expect(m.commands.length).toBeGreaterThan(0);
    });
  });

  it("should have correct module categories", async () => {
    const { MODULES } = await import("../lib/modules-context");
    const validCategories = ["offensive", "intel", "utility", "ai", "blockchain", "repos"];
    MODULES.forEach((m) => {
      expect(validCategories).toContain(m.category);
    });
  });

  it("should have all expected module names", async () => {
    const { MODULES } = await import("../lib/modules-context");
    const names = MODULES.map((m) => m.name);
    const expected = [
      "CONTROL CENTER", "QUANTUM INTEL", "OSINT DASHBOARD", "DEEP EXTRACTOR",
      "PAYLOAD VAULT", "ATTACK CONSOLE", "ZXCDDOS", "QUANTUM IDE",
      "ZOMBIE SWARM", "KIMIKUKIU REPOS", "WHOAMISEC GPT", "MEDIA FORGE",
      "KERNEL CONFIG", "GPT CHAT", "IDE", "SOLANA", "DEPLOYER",
      "QUANTUM", "SCANNER", "S3 BUCKETS", "BLACKHAT", "LAZARUS APT",
      "BURPSUITE", "OWASP ZAP", "TERMINAL CONSOLE",
    ];
    expected.forEach((name) => {
      expect(names).toContain(name);
    });
  });

  it("total tools should be 100+", async () => {
    const { MODULES } = await import("../lib/modules-context");
    const totalTools = MODULES.reduce((acc, m) => acc + m.tools.length, 0);
    expect(totalTools).toBeGreaterThanOrEqual(100);
  });

  it("each module should have a color", async () => {
    const { MODULES } = await import("../lib/modules-context");
    MODULES.forEach((m) => {
      expect(m.color).toBeTruthy();
      expect(m.color).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });

  it("each module should have a description", async () => {
    const { MODULES } = await import("../lib/modules-context");
    MODULES.forEach((m) => {
      expect(m.description).toBeTruthy();
      expect(m.description.length).toBeGreaterThan(10);
    });
  });
});

// ============================================================
// Server Router Tests
// ============================================================
describe("Server Routers", () => {
  it("should export appRouter", async () => {
    const { appRouter } = await import("../server/routers");
    expect(appRouter).toBeDefined();
  });

  it("should have ai.chat procedure", async () => {
    const { appRouter } = await import("../server/routers");
    expect((appRouter as any)._def.procedures["ai.chat"]).toBeDefined();
  });

  it("should have ai.executeModule procedure", async () => {
    const { appRouter } = await import("../server/routers");
    expect((appRouter as any)._def.procedures["ai.executeModule"]).toBeDefined();
  });

  it("should have ai.selfRepair procedure", async () => {
    const { appRouter } = await import("../server/routers");
    expect((appRouter as any)._def.procedures["ai.selfRepair"]).toBeDefined();
  });

  it("should have metrics.getSystemMetrics procedure", async () => {
    const { appRouter } = await import("../server/routers");
    expect((appRouter as any)._def.procedures["metrics.getSystemMetrics"]).toBeDefined();
  });

  it("should have console.executeCommand procedure", async () => {
    const { appRouter } = await import("../server/routers");
    expect((appRouter as any)._def.procedures["console.executeCommand"]).toBeDefined();
  });
});

// ============================================================
// Theme Tests
// ============================================================
describe("Theme Configuration", () => {
  it("should have all required color tokens", async () => {
    const { themeColors } = await import("../theme.config");
    const required = ["primary", "background", "surface", "foreground", "muted", "border", "success", "warning", "error"];
    const colors = themeColors as Record<string, { light: string; dark: string }>;
    required.forEach((token) => {
      expect(colors[token]).toBeDefined();
      expect(colors[token].light).toBeTruthy();
      expect(colors[token].dark).toBeTruthy();
    });
  });

  it("dark theme should have dark background", async () => {
    const { themeColors } = await import("../theme.config");
    // Dark background should be a dark color
    expect(themeColors.background.dark).toMatch(/^#[0-1][0-9a-fA-F]/);
  });
});
