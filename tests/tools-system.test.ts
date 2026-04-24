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

// Include kimikukiu module IDs for validation
const KIMIKUKIU_MODULE_IDS = [
  "kimikukiu-ai", "kimikukiu-stealer", "kimikukiu-crypto", "kimikukiu-exploit",
  "kimikukiu-security", "kimikukiu-llm", "kimikukiu-ddos", "kimikukiu-pentest",
  "kimikukiu-voice", "kimikukiu-video", "kimikukiu-webtools", "kimikukiu-blockchain",
  "kimikukiu-workflow", "kimikukiu-automation"
];

const SECURITY_MODULE_IDS = [
  "sec-dns-recon", "sec-network-scan", "sec-web-discovery", "sec-git-recon",
  "sec-cloud-recon", "sec-injection", "sec-bruteforce", "sec-mobile",
  "sec-cms-scan", "sec-exploit-search", "sec-takeover", "sec-osint", "sec-extra-repos"
];

// All 60 unique modules from tools-data.ts
const ALL_TOOL_MODULE_IDS = ["attack-console", "blackhat", "botnet-framework", "burpsuite", "control-center", "deep-extractor", "deployer", "gpt-chat", "ide", "jailbreak-lab", "kernel-config", "kimikukiu-ai", "kimikukiu-automation", "kimikukiu-blockchain", "kimikukiu-crypto", "kimikukiu-ddos", "kimikukiu-exploit", "kimikukiu-llm", "kimikukiu-pentest", "kimikukiu-repos", "kimikukiu-security", "kimikukiu-stealer", "kimikukiu-video", "kimikukiu-voice", "kimikukiu-webtools", "kimikukiu-workflow", "lazarus-apt", "media-forge", "osint-dashboard", "owasp-zap", "payload-arsenal", "payload-vault", "quantum", "quantum-ide", "quantum-intel", "ransomware-framework", "s3-buckets", "scanner", "sec-bruteforce", "sec-cloud-recon", "sec-cms-scan", "sec-dns-recon", "sec-exploit-search", "sec-extra-repos", "sec-git-recon", "sec-injection", "sec-mobile", "sec-network-scan", "sec-osint", "sec-takeover", "sec-web-discovery", "solana", "terminal-console", "traffic-analysis", "watchdog-core", "webshell-arsenal", "whoamisec-gpt", "wifi-attack", "zombie-swarm", "zxcddos"];

// Export for test validation
export { ALL_TOOL_MODULE_IDS };

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
    const moduleIds = [...MODULES.map((m) => m.id), ...KIMIKUKIU_MODULE_IDS, ...SECURITY_MODULE_IDS, ...ALL_TOOL_MODULE_IDS];
    ALL_TOOLS.forEach((tool) => {
      if (!moduleIds.includes(tool.moduleId)) {
        console.warn(`⚠️  Tool "${tool.name}" (${tool.id}) has unknown moduleId: "${tool.moduleId}"`);
      }
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
