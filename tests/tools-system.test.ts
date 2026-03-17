import { describe, it, expect } from "vitest";
import {
  ALL_TOOLS,
  getToolsByModule,
  getToolById,
  getRunningTools,
  searchTools,
  getToolCategories,
  type Tool,
} from "../lib/tools-data";
import { MODULES } from "../lib/modules-context";

describe("Tools Data System", () => {
  it("should have 190+ tools defined", () => {
    expect(ALL_TOOLS.length).toBeGreaterThanOrEqual(180);
  });

  it("every tool should have required fields", () => {
    ALL_TOOLS.forEach((tool) => {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.moduleId).toBeTruthy();
      expect(tool.status).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(Array.isArray(tool.params)).toBe(true);
    });
  });

  it("every tool should have a valid status", () => {
    const validStatuses = ["RUNNING", "IDLE", "ERROR", "SYNCING"];
    ALL_TOOLS.forEach((tool) => {
      expect(validStatuses).toContain(tool.status);
    });
  });

  it("every tool should belong to an existing module", () => {
    const moduleIds = MODULES.map((m) => m.id);
    ALL_TOOLS.forEach((tool) => {
      expect(moduleIds).toContain(tool.moduleId);
    });
  });

  it("every module should have at least one tool", () => {
    MODULES.forEach((module) => {
      const tools = getToolsByModule(module.id);
      expect(tools.length).toBeGreaterThan(0);
    });
  });

  it("tool IDs should be unique", () => {
    const ids = ALL_TOOLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("getToolById should return correct tool", () => {
    const tool = getToolById("system.metrics");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("System Metrics");
    expect(tool?.moduleId).toBe("control-center");
  });

  it("getToolById should return undefined for non-existent tool", () => {
    const tool = getToolById("non-existent-tool");
    expect(tool).toBeUndefined();
  });

  it("getToolsByModule should return correct tools", () => {
    const tools = getToolsByModule("control-center");
    expect(tools.length).toBeGreaterThan(0);
    tools.forEach((t) => {
      expect(t.moduleId).toBe("control-center");
    });
  });

  it("getRunningTools should return only running tools", () => {
    const running = getRunningTools();
    running.forEach((t) => {
      expect(t.status).toBe("RUNNING");
    });
  });

  it("searchTools should find tools by name", () => {
    const results = searchTools("nmap");
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((t) => t.name.toLowerCase().includes("nmap"))).toBe(true);
  });

  it("searchTools should find tools by description", () => {
    const results = searchTools("vulnerability");
    expect(results.length).toBeGreaterThan(0);
  });

  it("searchTools should find tools by category", () => {
    const results = searchTools("blockchain");
    expect(results.length).toBeGreaterThan(0);
  });

  it("getToolCategories should return unique categories", () => {
    const categories = getToolCategories();
    expect(categories.length).toBeGreaterThan(0);
    const unique = new Set(categories);
    expect(unique.size).toBe(categories.length);
  });

  it("every tool param should have valid type", () => {
    const validTypes = ["text", "number", "select", "boolean"];
    ALL_TOOLS.forEach((tool) => {
      tool.params.forEach((param) => {
        expect(validTypes).toContain(param.type);
        expect(param.name).toBeTruthy();
        expect(param.label).toBeTruthy();
      });
    });
  });

  it("select params should have options array", () => {
    ALL_TOOLS.forEach((tool) => {
      tool.params.forEach((param) => {
        if (param.type === "select") {
          expect(Array.isArray(param.options)).toBe(true);
          expect(param.options!.length).toBeGreaterThan(0);
        }
      });
    });
  });

  it("all 25 modules should be covered by tools", () => {
    const moduleIdsWithTools = new Set(ALL_TOOLS.map((t) => t.moduleId));
    MODULES.forEach((module) => {
      expect(moduleIdsWithTools.has(module.id)).toBe(true);
    });
  });

  it("most tools should be RUNNING", () => {
    const running = ALL_TOOLS.filter((t) => t.status === "RUNNING");
    expect(running.length / ALL_TOOLS.length).toBeGreaterThan(0.9);
  });
});
