import { describe, it, expect } from "vitest";
import { ALL_TOOLS, getToolsByModule, getToolById, searchTools, getToolCategories, getRunningTools } from "../lib/tools-data";

describe("Kimikukiu Repos Integration", () => {
  it("should have 232+ total tools", () => {
    expect(ALL_TOOLS.length).toBeGreaterThanOrEqual(232);
  });

  it("should have kimikukiu tools with kk. prefix", () => {
    const kkTools = ALL_TOOLS.filter((t) => t.id.startsWith("kk."));
    expect(kkTools.length).toBeGreaterThanOrEqual(40);
  });

  it("all tools should have required fields", () => {
    ALL_TOOLS.forEach((tool) => {
      expect(tool.id).toBeTruthy();
      expect(tool.name).toBeTruthy();
      expect(tool.moduleId).toBeTruthy();
      expect(tool.status).toBeTruthy();
      expect(tool.category).toBeTruthy();
      expect(tool.description).toBeTruthy();
      expect(Array.isArray(tool.params)).toBe(true);
    });
  });

  it("all tools should have valid status", () => {
    ALL_TOOLS.forEach((tool) => {
      expect(["RUNNING", "IDLE", "ERROR"]).toContain(tool.status);
    });
  });

  it("should find tools by module ID", () => {
    const aiTools = getToolsByModule("kimikukiu-ai");
    expect(aiTools.length).toBeGreaterThan(0);
    aiTools.forEach((t) => expect(t.moduleId).toBe("kimikukiu-ai"));
  });

  it("should find tool by ID", () => {
    const tool = getToolById("kk.imagereward");
    expect(tool).toBeDefined();
    expect(tool?.name).toBe("ImageReward");
  });

  it("should search tools by name", () => {
    const results = searchTools("GLM");
    expect(results.length).toBeGreaterThan(0);
    results.forEach((t) => {
      const match =
        t.name.toLowerCase().includes("glm") ||
        t.description.toLowerCase().includes("glm") ||
        t.id.toLowerCase().includes("glm") ||
        t.category.toLowerCase().includes("glm");
      expect(match).toBe(true);
    });
  });

  it("should get all tool categories", () => {
    const categories = getToolCategories();
    expect(categories.length).toBeGreaterThan(5);
    expect(categories).toContain("ai-ml");
    expect(categories).toContain("security");
  });

  it("should get running tools", () => {
    const running = getRunningTools();
    expect(running.length).toBeGreaterThan(200);
    running.forEach((t) => expect(t.status).toBe("RUNNING"));
  });

  it("kimikukiu AI/ML module should have correct tools", () => {
    const tools = getToolsByModule("kimikukiu-ai");
    const toolIds = tools.map((t) => t.id);
    expect(toolIds).toContain("kk.imagereward");
    expect(toolIds).toContain("kk.cogvideo");
  });

  it("kimikukiu security module should have tools", () => {
    const tools = getToolsByModule("kimikukiu-security");
    expect(tools.length).toBeGreaterThan(0);
  });

  it("kimikukiu LLM module should have tools", () => {
    const tools = getToolsByModule("kimikukiu-llm");
    expect(tools.length).toBeGreaterThan(0);
  });

  it("all tool params should have required fields", () => {
    ALL_TOOLS.forEach((tool) => {
      tool.params.forEach((param) => {
        expect(param.name).toBeTruthy();
        expect(param.type).toBeTruthy();
        expect(param.label).toBeTruthy();
        expect(["text", "number", "select", "boolean"]).toContain(param.type);
      });
    });
  });

  it("no duplicate tool IDs", () => {
    const ids = ALL_TOOLS.map((t) => t.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("all moduleIds should reference valid module categories", () => {
    const kkTools = ALL_TOOLS.filter((t) => t.id.startsWith("kk."));
    const validModuleIds = [
      "kimikukiu-ai", "kimikukiu-stealer", "kimikukiu-crypto", "kimikukiu-exploit",
      "kimikukiu-security", "kimikukiu-llm", "kimikukiu-ddos", "kimikukiu-pentest",
      "kimikukiu-voice", "kimikukiu-video", "kimikukiu-webtools", "kimikukiu-blockchain",
      "kimikukiu-workflow", "kimikukiu-automation"
    ];
    kkTools.forEach((t) => {
      expect(validModuleIds).toContain(t.moduleId);
    });
  });
});
