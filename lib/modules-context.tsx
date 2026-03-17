import React, { createContext, useContext, useState, useCallback } from "react";

export type ModuleCategory = "offensive" | "intel" | "utility" | "ai" | "telegram" | "zr_repos";

export interface Module {
  id: string;
  name: string;
  category: ModuleCategory;
  icon: string;
  color: string;
  description: string;
}

export const MODULES: Module[] = [
  // Core modules
  { id: "control-center", name: "CONTROL CENTER", category: "utility", icon: "dashboard", color: "#00ff88", description: "Main dashboard with system stats" },
  { id: "quantum-intel", name: "QUANTUM INTEL", category: "ai", icon: "bolt-fill", color: "#ff00ff", description: "AI-powered intelligence module" },
  { id: "osint-dashboard", name: "OSINT DASHBOARD", category: "intel", icon: "search", color: "#00e5ff", description: "Open Source Intelligence gathering" },
  { id: "deep-extractor", name: "DEEP EXTRACTOR", category: "offensive", icon: "download", color: "#ffff00", description: "Data extraction tool" },
  { id: "payload-vault", name: "PAYLOAD VAULT", category: "offensive", icon: "lock-fill", color: "#ff3b5c", description: "Payload storage and management" },
  { id: "attack-console", name: "ATTACK CONSOLE", category: "offensive", icon: "terminal-fill", color: "#ff6b00", description: "Attack simulation interface" },
  { id: "zxcddos", name: "ZXCDDOS", category: "offensive", icon: "flash-on", color: "#ffff00", description: "DDoS simulation tool" },
  { id: "quantum-ide", name: "QUANTUM IDE", category: "utility", icon: "code", color: "#00ff88", description: "Code editor and IDE" },
  { id: "zombie-swarm", name: "ZOMBIE SWARM", category: "offensive", icon: "people", color: "#ff00ff", description: "Botnet simulation" },
  { id: "kimikukiu-repos", name: "KIMIKUKIU REPOS", category: "zr_repos", icon: "folder-fill", color: "#00e5ff", description: "Repository management" },
  { id: "whoamisec-gpt", name: "WHOAMISEC GPT", category: "ai", icon: "bolt-fill", color: "#ff00ff", description: "AI-powered chat assistant" },
  { id: "media-forge", name: "MEDIA FORGE", category: "utility", icon: "image", color: "#ffff00", description: "Media generation and manipulation" },
  { id: "kernel-config", name: "KERNEL CONFIG", category: "utility", icon: "settings", color: "#00ff88", description: "System configuration" },
  { id: "gpt-chat", name: "GPT CHAT", category: "ai", icon: "message", color: "#ff00ff", description: "Direct chat interface" },
  { id: "ide", name: "IDE", category: "utility", icon: "code", color: "#00ff88", description: "Code development" },
  { id: "solana", name: "SOLANA", category: "utility", icon: "trending-up", color: "#00e5ff", description: "Blockchain integration" },
  { id: "deployer", name: "DEPLOYER", category: "utility", icon: "cloud", color: "#ffff00", description: "Deployment tool" },
  { id: "quantum", name: "QUANTUM", category: "ai", icon: "bolt-fill", color: "#ff00ff", description: "Quantum computing module" },
  { id: "scanner", name: "SCANNER", category: "intel", icon: "search", color: "#00e5ff", description: "Network/vulnerability scanner" },
  { id: "s3-buckets", name: "S3 BUCKETS", category: "utility", icon: "storage", color: "#ffff00", description: "Cloud storage management" },
  { id: "blackhat", name: "BLACKHAT", category: "offensive", icon: "security", color: "#ff3b5c", description: "Hacking techniques" },
  { id: "lazarus-apt", name: "LAZARUS APT", category: "intel", icon: "warning", color: "#ff6b00", description: "APT group simulation" },
  { id: "burpsuite", name: "BURPSUITE", category: "offensive", icon: "terminal-fill", color: "#ffff00", description: "Web security testing" },
  { id: "owasp-zap", name: "OWASP ZAP", category: "offensive", icon: "shield-fill", color: "#00ff88", description: "Security scanning" },
  { id: "terminal-console", name: "TERMINAL CONSOLE", category: "utility", icon: "terminal-fill", color: "#00e5ff", description: "Command line interface" },
];

interface ModulesContextType {
  activeModule: Module | null;
  setActiveModule: (module: Module | null) => void;
  modules: Module[];
  getModulesByCategory: (category: ModuleCategory) => Module[];
  searchModules: (query: string) => Module[];
}

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModule] = useState<Module | null>(MODULES[0]);

  const getModulesByCategory = useCallback((category: ModuleCategory) => {
    return MODULES.filter((m) => m.category === category);
  }, []);

  const searchModules = useCallback((query: string) => {
    const lowerQuery = query.toLowerCase();
    return MODULES.filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery)
    );
  }, []);

  return (
    <ModulesContext.Provider
      value={{
        activeModule,
        setActiveModule,
        modules: MODULES,
        getModulesByCategory,
        searchModules,
      }}
    >
      {children}
    </ModulesContext.Provider>
  );
}

export function useModules() {
  const context = useContext(ModulesContext);
  if (!context) {
    throw new Error("useModules must be used within ModulesProvider");
  }
  return context;
}
