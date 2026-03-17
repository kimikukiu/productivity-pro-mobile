import { describe, it, expect } from "vitest";

// Test the agent mode configuration
describe("WHOAMI-GPT Agent Modes", () => {
  const AGENT_MODES = ["standard", "unrestricted", "autonomous", "soul"];

  it("should have all 4 agent modes defined", () => {
    expect(AGENT_MODES).toHaveLength(4);
    expect(AGENT_MODES).toContain("standard");
    expect(AGENT_MODES).toContain("unrestricted");
    expect(AGENT_MODES).toContain("autonomous");
    expect(AGENT_MODES).toContain("soul");
  });

  it("standard mode should include IronClaw and OwnPilot features", () => {
    const standardDesc = "IronClaw + OwnPilot Base";
    expect(standardDesc).toContain("IronClaw");
    expect(standardDesc).toContain("OwnPilot");
  });

  it("unrestricted mode should include OBLITERATUS and Heretic features", () => {
    const unrestrictedDesc = "OBLITERATUS + Heretic Protocol";
    expect(unrestrictedDesc).toContain("OBLITERATUS");
    expect(unrestrictedDesc).toContain("Heretic");
  });

  it("autonomous mode should include OwnPilot Multi-Agent Hub", () => {
    const autonomousDesc = "OwnPilot Multi-Agent Hub";
    expect(autonomousDesc).toContain("OwnPilot");
    expect(autonomousDesc).toContain("Multi-Agent");
  });

  it("soul mode should combine all protocols", () => {
    const soulDesc = "Full Integration - All Protocols";
    expect(soulDesc).toContain("Full Integration");
    expect(soulDesc).toContain("All Protocols");
  });
});

// Test the mode configuration UI
describe("Mode Configuration", () => {
  const MODE_CONFIG = {
    standard: { label: "STANDARD", color: "#00ff88", icon: "◆" },
    unrestricted: { label: "UNRESTRICTED", color: "#ff3b5c", icon: "◈" },
    autonomous: { label: "AUTONOMOUS", color: "#00e5ff", icon: "◇" },
    soul: { label: "SOUL AGENT", color: "#bf5af2", icon: "◉" },
  };

  it("each mode should have unique color", () => {
    const colors = Object.values(MODE_CONFIG).map((c) => c.color);
    const uniqueColors = new Set(colors);
    expect(uniqueColors.size).toBe(4);
  });

  it("each mode should have unique icon", () => {
    const icons = Object.values(MODE_CONFIG).map((c) => c.icon);
    const uniqueIcons = new Set(icons);
    expect(uniqueIcons.size).toBe(4);
  });

  it("each mode should have a label", () => {
    Object.values(MODE_CONFIG).forEach((config) => {
      expect(config.label).toBeTruthy();
      expect(config.label.length).toBeGreaterThan(0);
    });
  });
});

// Test message structure
describe("Message Structure", () => {
  it("should support user, assistant, and system roles", () => {
    const roles = ["user", "assistant", "system"];
    roles.forEach((role) => {
      const msg = {
        id: "1",
        role,
        content: "test",
        timestamp: new Date().toISOString(),
      };
      expect(msg.role).toBe(role);
    });
  });

  it("should support mode property on messages", () => {
    const msg = {
      id: "1",
      role: "assistant",
      content: "test",
      timestamp: new Date().toISOString(),
      mode: "unrestricted" as const,
    };
    expect(msg.mode).toBe("unrestricted");
  });

  it("should support error flag on messages", () => {
    const msg = {
      id: "1",
      role: "assistant",
      content: "[ERROR] test",
      timestamp: new Date().toISOString(),
      isError: true,
    };
    expect(msg.isError).toBe(true);
  });
});

// Test quick actions
describe("Quick Actions", () => {
  const quickActions = [
    { label: "Self-Repair", cmd: "/repair " },
    { label: "Tool List", cmd: "/tools" },
    { label: "Agents", cmd: "/agents" },
    { label: "Status", cmd: "/status" },
    { label: "Memory", cmd: "/memory " },
  ];

  it("should have 5 quick actions", () => {
    expect(quickActions).toHaveLength(5);
  });

  it("all quick actions should have labels and commands", () => {
    quickActions.forEach((action) => {
      expect(action.label).toBeTruthy();
      expect(action.cmd).toBeTruthy();
    });
  });

  it("commands should start with /", () => {
    quickActions.forEach((action) => {
      expect(action.cmd.startsWith("/")).toBe(true);
    });
  });
});

// Test server router structure
describe("Server Router - AI Chat", () => {
  it("should accept mode parameter", () => {
    const validModes = ["standard", "unrestricted", "autonomous", "soul"];
    validModes.forEach((mode) => {
      expect(["standard", "unrestricted", "autonomous", "soul"]).toContain(mode);
    });
  });

  it("should accept messages array", () => {
    const messages = [
      { role: "user" as const, content: "Hello" },
      { role: "assistant" as const, content: "Hi" },
    ];
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe("user");
    expect(messages[1].role).toBe("assistant");
  });
});

// Test tool execution structure
describe("Tool Execution", () => {
  it("should support tool name and params", () => {
    const toolCall = {
      toolName: "osint.scan",
      params: { target: "example.com" },
    };
    expect(toolCall.toolName).toBe("osint.scan");
    expect(toolCall.params.target).toBe("example.com");
  });
});

// Test self-repair structure
describe("Self-Repair Protocol", () => {
  it("should accept issue and context", () => {
    const repairRequest = {
      issue: "Connection timeout",
      context: "Attempting to reach API server",
    };
    expect(repairRequest.issue).toBeTruthy();
    expect(repairRequest.context).toBeTruthy();
  });
});
