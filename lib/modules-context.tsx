import React, { createContext, useContext, useState, useCallback } from "react";

export type ModuleCategory = "offensive" | "intel" | "utility" | "ai" | "blockchain" | "repos";
export type ModuleStatus = "RUNNING" | "STANDBY" | "ERROR" | "SYNCING";

export interface Module {
  id: string;
  name: string;
  category: ModuleCategory;
  icon: string;
  color: string;
  description: string;
  status: ModuleStatus;
  tools: string[];
  commands: string[];
}

export const MODULES: Module[] = [
  {
    id: "control-center", name: "CONTROL CENTER", category: "utility",
    icon: "dashboard", color: "#00ff88",
    description: "Main dashboard with live metrics, system status, neural mesh monitoring",
    status: "RUNNING",
    tools: ["system.metrics", "system.health", "system.logs", "system.alerts"],
    commands: ["status", "refresh", "reset", "export"],
  },
  {
    id: "quantum-intel", name: "QUANTUM INTEL", category: "intel",
    icon: "bolt-fill", color: "#ff00ff",
    description: "Quantum-encrypted intelligence gathering, key distribution, signal analysis",
    status: "RUNNING",
    tools: ["intel.quantum_scan", "intel.key_distribution", "intel.signal_intercept", "intel.decrypt"],
    commands: ["scan", "intercept", "decrypt", "analyze", "report"],
  },
  {
    id: "osint-dashboard", name: "OSINT DASHBOARD", category: "intel",
    icon: "search", color: "#00e5ff",
    description: "Social media recon, domain/IP lookup, breach databases, Shodan, Censys integration",
    status: "RUNNING",
    tools: ["osint.social_recon", "osint.domain_lookup", "osint.breach_search", "osint.shodan", "osint.censys", "osint.whois", "osint.dns_enum"],
    commands: ["lookup", "search", "enumerate", "trace", "profile"],
  },
  {
    id: "deep-extractor", name: "DEEP EXTRACTOR", category: "offensive",
    icon: "download", color: "#ffff00",
    description: "Dark web scraping, hidden service discovery, .onion crawling, data extraction",
    status: "RUNNING",
    tools: ["deep.scrape", "deep.crawl_onion", "deep.extract_data", "deep.discover_services"],
    commands: ["scrape", "crawl", "extract", "discover", "dump"],
  },
  {
    id: "payload-vault", name: "PAYLOAD VAULT", category: "offensive",
    icon: "lock-fill", color: "#ff3b5c",
    description: "Payload generation, encoding, obfuscation, polymorphic engines, delivery",
    status: "RUNNING",
    tools: ["payload.generate", "payload.encode", "payload.obfuscate", "payload.deliver", "payload.polymorph"],
    commands: ["generate", "encode", "obfuscate", "deliver", "list", "delete"],
  },
  {
    id: "attack-console", name: "ATTACK CONSOLE", category: "offensive",
    icon: "terminal-fill", color: "#ff6b00",
    description: "Exploit execution, kill chain management, lateral movement, persistence",
    status: "RUNNING",
    tools: ["attack.exploit", "attack.lateral_move", "attack.persist", "attack.escalate", "attack.exfiltrate"],
    commands: ["exploit", "pivot", "escalate", "persist", "exfil", "cleanup"],
  },
  {
    id: "zxcddos", name: "ZXCDDOS", category: "offensive",
    icon: "flash-on", color: "#ffff00",
    description: "Stress testing, traffic generation, amplification vectors, Layer 7 attacks",
    status: "RUNNING",
    tools: ["ddos.stress_test", "ddos.amplify", "ddos.layer7", "ddos.slowloris", "ddos.syn_flood"],
    commands: ["stress", "amplify", "flood", "slowloris", "stop", "status"],
  },
  {
    id: "quantum-ide", name: "QUANTUM IDE", category: "utility",
    icon: "code", color: "#00ff88",
    description: "Full code editor, multi-language support, compilation, debugging, AI assist",
    status: "RUNNING",
    tools: ["code.edit", "code.compile", "code.debug", "code.format", "code.analyze"],
    commands: ["new", "open", "save", "compile", "run", "debug", "format"],
  },
  {
    id: "zombie-swarm", name: "ZOMBIE SWARM", category: "offensive",
    icon: "people", color: "#ff00ff",
    description: "C2 management, node orchestration, swarm intelligence, P2P mesh network",
    status: "RUNNING",
    tools: ["swarm.deploy", "swarm.command", "swarm.status", "swarm.recall", "swarm.mesh"],
    commands: ["deploy", "command", "status", "recall", "mesh", "kill"],
  },
  {
    id: "kimikukiu-repos", name: "KIMIKUKIU REPOS", category: "repos",
    icon: "folder-fill", color: "#00e5ff",
    description: "GitHub repository browser, code analysis, vulnerability scanning, dependency audit",
    status: "RUNNING",
    tools: ["repo.browse", "repo.analyze", "repo.scan_vulns", "repo.audit_deps", "repo.clone"],
    commands: ["browse", "analyze", "scan", "audit", "clone", "search"],
  },
  {
    id: "whoamisec-gpt", name: "WHOAMISEC GPT", category: "ai",
    icon: "bolt-fill", color: "#bf5af2",
    description: "Quantum Intelligence Ultra - Fully autonomous AI agent with all protocols",
    status: "RUNNING",
    tools: ["ai.chat", "ai.agent", "ai.orchestrate", "ai.self_repair", "ai.tool_build"],
    commands: ["chat", "agent", "orchestrate", "repair", "build_tool"],
  },
  {
    id: "media-forge", name: "MEDIA FORGE", category: "utility",
    icon: "image", color: "#ffff00",
    description: "Image/video/audio generation, deepfake detection, steganography, EXIF analysis",
    status: "RUNNING",
    tools: ["media.generate", "media.detect_deepfake", "media.stego_encode", "media.stego_decode", "media.exif"],
    commands: ["generate", "detect", "encode", "decode", "analyze", "strip"],
  },
  {
    id: "kernel-config", name: "KERNEL CONFIG", category: "utility",
    icon: "settings", color: "#00ff88",
    description: "Kernel parameters, security hardening, firewall rules, SELinux, AppArmor",
    status: "RUNNING",
    tools: ["kernel.config", "kernel.harden", "kernel.firewall", "kernel.selinux", "kernel.audit"],
    commands: ["config", "harden", "firewall", "audit", "status", "reset"],
  },
  {
    id: "gpt-chat", name: "GPT CHAT", category: "ai",
    icon: "message", color: "#ff00ff",
    description: "Direct AI chat interface with model selection and streaming responses",
    status: "RUNNING",
    tools: ["ai.chat", "ai.stream", "ai.complete"],
    commands: ["chat", "stream", "complete", "clear"],
  },
  {
    id: "ide", name: "IDE", category: "utility",
    icon: "code", color: "#00ff88",
    description: "Lightweight code editor with syntax highlighting and auto-complete",
    status: "RUNNING",
    tools: ["code.edit", "code.highlight", "code.complete"],
    commands: ["new", "open", "save", "run"],
  },
  {
    id: "solana", name: "SOLANA", category: "blockchain",
    icon: "trending-up", color: "#00e5ff",
    description: "Wallet analysis, smart contract interaction, token tracking, MEV, DeFi",
    status: "RUNNING",
    tools: ["solana.wallet", "solana.contract", "solana.token", "solana.mev", "solana.defi"],
    commands: ["wallet", "contract", "token", "swap", "analyze", "track"],
  },
  {
    id: "deployer", name: "DEPLOYER", category: "utility",
    icon: "cloud", color: "#ffff00",
    description: "CI/CD pipelines, Docker, Kubernetes, server provisioning, auto-scaling",
    status: "RUNNING",
    tools: ["deploy.docker", "deploy.k8s", "deploy.provision", "deploy.scale", "deploy.monitor"],
    commands: ["deploy", "build", "push", "scale", "rollback", "status"],
  },
  {
    id: "quantum", name: "QUANTUM", category: "ai",
    icon: "bolt-fill", color: "#ff00ff",
    description: "Quantum computing simulation, Shor's algorithm, Grover's search, qubit management",
    status: "RUNNING",
    tools: ["quantum.simulate", "quantum.shor", "quantum.grover", "quantum.entangle"],
    commands: ["simulate", "shor", "grover", "entangle", "measure", "reset"],
  },
  {
    id: "scanner", name: "SCANNER", category: "intel",
    icon: "search", color: "#00e5ff",
    description: "Nmap, Masscan, service enumeration, CVE lookup, exploit matching, fingerprinting",
    status: "RUNNING",
    tools: ["scan.nmap", "scan.masscan", "scan.cve", "scan.exploit_match", "scan.fingerprint"],
    commands: ["scan", "enumerate", "cve", "match", "fingerprint", "report"],
  },
  {
    id: "s3-buckets", name: "S3 BUCKETS", category: "utility",
    icon: "storage", color: "#ffff00",
    description: "Bucket enumeration, misconfiguration detection, data exfiltration, access control",
    status: "RUNNING",
    tools: ["s3.enumerate", "s3.misconfig", "s3.exfil", "s3.acl", "s3.upload"],
    commands: ["enumerate", "scan", "download", "upload", "acl", "report"],
  },
  {
    id: "blackhat", name: "BLACKHAT", category: "offensive",
    icon: "security", color: "#ff3b5c",
    description: "Metasploit, social engineering toolkit, phishing frameworks, credential harvesting",
    status: "RUNNING",
    tools: ["blackhat.metasploit", "blackhat.set", "blackhat.phish", "blackhat.harvest", "blackhat.bruteforce"],
    commands: ["exploit", "phish", "harvest", "brute", "spray", "dump"],
  },
  {
    id: "lazarus-apt", name: "LAZARUS APT", category: "intel",
    icon: "warning", color: "#ff6b00",
    description: "APT emulation, campaign management, TTPs, MITRE ATT&CK mapping, threat intel",
    status: "RUNNING",
    tools: ["apt.emulate", "apt.campaign", "apt.ttps", "apt.mitre", "apt.intel"],
    commands: ["emulate", "campaign", "map", "intel", "report", "simulate"],
  },
  {
    id: "burpsuite", name: "BURPSUITE", category: "offensive",
    icon: "terminal-fill", color: "#ffff00",
    description: "Web proxy, active scanning, intruder, repeater, sequencer, decoder",
    status: "RUNNING",
    tools: ["burp.proxy", "burp.scan", "burp.intruder", "burp.repeater", "burp.sequencer", "burp.decoder"],
    commands: ["proxy", "scan", "intruder", "repeat", "sequence", "decode"],
  },
  {
    id: "owasp-zap", name: "OWASP ZAP", category: "offensive",
    icon: "shield-fill", color: "#00ff88",
    description: "Passive/active scanning, fuzzing, spidering, API testing, authentication testing",
    status: "RUNNING",
    tools: ["zap.scan", "zap.fuzz", "zap.spider", "zap.api_test", "zap.auth_test"],
    commands: ["scan", "fuzz", "spider", "api", "auth", "report"],
  },
  {
    id: "terminal-console", name: "TERMINAL CONSOLE", category: "utility",
    icon: "terminal-fill", color: "#00e5ff",
    description: "Full terminal emulator, command execution, shell access, scripting engine",
    status: "RUNNING",
    tools: ["terminal.exec", "terminal.script", "terminal.pipe", "terminal.cron"],
    commands: ["exec", "script", "pipe", "cron", "history", "clear"],
  },
];

interface ModulesContextType {
  activeModule: Module | null;
  setActiveModule: (module: Module | null) => void;
  modules: Module[];
  getModulesByCategory: (category: ModuleCategory) => Module[];
  searchModules: (query: string) => Module[];
  getModuleById: (id: string) => Module | undefined;
  getRunningModules: () => Module[];
  getAllTools: () => string[];
}

// ── KIMIKUKIU REPOS MODULES ──
const KIMIKUKIU_MODULES: Module[] = [
  {
    id: "kimikukiu-ai", name: "KIMIKUKIU AI/ML", category: "ai",
    icon: "bolt-fill", color: "#bf5af2",
    description: "AI/ML models: ImageReward, CogVideo, GLM-Image, TheGodOfAI, OpenClaw, CaRR, MCF, W0rm-GPT",
    status: "RUNNING",
    tools: ["kk.imagereward", "kk.cogvideo", "kk.glm_image", "kk.carr", "kk.w0rm_gpt", "kk.mcf", "kk.thegodofai", "kk.openclaw_android_assistant"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-stealer", name: "KIMIKUKIU STEALER", category: "offensive",
    icon: "lock-fill", color: "#ff00ff",
    description: "Stealer tools: Satan-Stealer, Cryptocurrency-Stealer",
    status: "RUNNING",
    tools: ["kk.satan_stealer", "kk.cryptocurrency_stealer"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-crypto", name: "KIMIKUKIU CRYPTO", category: "blockchain",
    icon: "trending-up", color: "#ffff00",
    description: "Crypto mining: CryptoNote Easy Miner with GUI setup",
    status: "RUNNING",
    tools: ["kk.cryptonote_easy_miner"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-exploit", name: "KIMIKUKIU EXPLOIT", category: "offensive",
    icon: "warning", color: "#ff6b00",
    description: "Exploit tools: LabExploit, XGPT-WormGPT, BitlockMove, CVE-2025-43300 PoC",
    status: "RUNNING",
    tools: ["kk.labexploit", "kk.xgpt_wormgpt", "kk.bitlockmove", "kk.cve_2025_43300", "kk.fuckjews"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-security", name: "KIMIKUKIU SECURITY", category: "offensive",
    icon: "shield-fill", color: "#ff3b5c",
    description: "Security tools: AiScan-N, Hexstrike-AI 150+ tools, TLS, Hajime-AG, WHM-UN1C, PiuPiuBoomBoom",
    status: "RUNNING",
    tools: ["kk.aiscan_n", "kk.hexstrike_ai", "kk.tls", "kk.hajime_ag", "kk.whm_un1c", "kk.piupiuboomboom"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-webtools", name: "KIMIKUKIU WEB TOOLS", category: "utility",
    icon: "code", color: "#ffff00",
    description: "Web tools: P4RS3LT0NGV3 steganography, WEB-CLONER, LinkScrapper",
    status: "RUNNING",
    tools: ["kk.p4rs3lt0ngv3", "kk.web_cloner", "kk.linkscrapper"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-video", name: "KIMIKUKIU VIDEO", category: "utility",
    icon: "video", color: "#ffff00",
    description: "Video generation: RealVideo streaming, Kaleido multi-subject reference video",
    status: "RUNNING",
    tools: ["kk.realvideo", "kk.kaleido"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-voice", name: "KIMIKUKIU VOICE", category: "utility",
    icon: "volume-up", color: "#00ff88",
    description: "Voice tools: GLM-TTS, GLM-ASR speech recognition, GPT-SoVITS voice cloning",
    status: "RUNNING",
    tools: ["kk.glm_tts", "kk.glm_asr", "kk.gpt_sovits"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-llm", name: "KIMIKUKIU LLM", category: "ai",
    icon: "message", color: "#bf5af2",
    description: "LLM suite: GLM-5, GLM-4.5, GLM-V, vLLM, AgentBench, LeakHub, promptfoo, slime, worm-ai, AutoTemp, Open-AutoGLM, KaliGPT",
    status: "RUNNING",
    tools: ["kk.leakhub", "kk.glm_v", "kk.agentbench", "kk.vllm", "kk.glm_5", "kk.glm_4_5", "kk.glm_simple_evals", "kk.worm_ai"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-blockchain", name: "KIMIKUKIU BLOCKCHAIN", category: "blockchain",
    icon: "trending-up", color: "#00ff88",
    description: "Blockchain: Reth Ethereum protocol implementation in Rust",
    status: "RUNNING",
    tools: ["kk.reth"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-pentest", name: "KIMIKUKIU PENTEST", category: "offensive",
    icon: "terminal-fill", color: "#ff6b00",
    description: "Pentesting: PentAGI autonomous, SQLForce injection, KaliGPT CLI",
    status: "RUNNING",
    tools: ["kk.pentagi", "kk.sqlforce", "kk.kaligpt"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-workflow", name: "KIMIKUKIU WORKFLOW", category: "utility",
    icon: "settings", color: "#00ff88",
    description: "Workflow: Kestra event-driven orchestration platform",
    status: "RUNNING",
    tools: ["kk.kestra"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-ddos", name: "KIMIKUKIU DDOS", category: "offensive",
    icon: "flash-on", color: "#ff3b5c",
    description: "DDoS tools: Method C, EXECUTOR-DDOS stress testing",
    status: "RUNNING",
    tools: ["kk.method_c", "kk.executor_ddos"],
    commands: ["run", "config", "status", "execute", "help"],
  },
  {
    id: "kimikukiu-automation", name: "KIMIKUKIU AUTOMATION", category: "utility",
    icon: "settings", color: "#00e5ff",
    description: "Automation: Install-setup, T-Bot-OTP Telegram bot",
    status: "RUNNING",
    tools: ["kk.install_setup", "kk.t_bot_otp"],
    commands: ["run", "config", "status", "execute", "help"],
  },
];

const SECURITY_MODULES: Module[] = [
  {
    id: "sec-dns-recon", name: "DNS & SUBDOMAIN RECON", category: "intel",
    icon: "globe", color: "#00ff88",
    description: "DNS enumeration, subdomain discovery: dnscan, Knockpy, Sublist3r, massdns, Amass",
    status: "RUNNING",
    tools: ["sec.dnscan", "sec.knockpy", "sec.sublist3r", "sec.massdns", "sec.amass"],
    commands: ["scan", "enumerate", "resolve", "export"],
  },
  {
    id: "sec-network-scan", name: "NETWORK SCANNING", category: "intel",
    icon: "wifi", color: "#00e5ff",
    description: "Port scanning, service detection: Nmap, Masscan, EyeWitness, Sn1per, XRay",
    status: "RUNNING",
    tools: ["sec.nmap", "sec.masscan", "sec.eyewitness", "sec.sn1per", "sec.xray"],
    commands: ["scan", "discover", "fingerprint", "export"],
  },
  {
    id: "sec-web-discovery", name: "WEB CONTENT DISCOVERY", category: "intel",
    icon: "search", color: "#ffd60a",
    description: "Directory brute-forcing, content discovery: DirBuster, dirsearch, wfuzz, GoogD0rker, Wayback, ProjectDiscovery",
    status: "RUNNING",
    tools: ["sec.dirbuster", "sec.dirsearch", "sec.wfuzz", "sec.googd0rker", "sec.wayback", "sec.waybackurls", "sec.projectdiscovery"],
    commands: ["fuzz", "brute", "crawl", "dork", "export"],
  },
  {
    id: "sec-git-recon", name: "GIT & SOURCE RECON", category: "intel",
    icon: "code", color: "#bf5af2",
    description: "Git repo analysis, secret detection: Gitrob, git-secrets, GitTools, dvcs-ripper",
    status: "RUNNING",
    tools: ["sec.gitrob", "sec.git_secrets", "sec.gittools", "sec.dvcs_ripper"],
    commands: ["scan", "dump", "extract", "analyze"],
  },
  {
    id: "sec-cloud-recon", name: "CLOUD & BUCKET RECON", category: "intel",
    icon: "cloud", color: "#30d158",
    description: "S3 bucket discovery, cloud misconfig: sandcastle, bucket_finder",
    status: "RUNNING",
    tools: ["sec.sandcastle", "sec.bucket_finder"],
    commands: ["enumerate", "check", "download", "export"],
  },
  {
    id: "sec-injection", name: "INJECTION & EXPLOITATION", category: "offensive",
    icon: "warning", color: "#ff453a",
    description: "SQL injection, XXE, SSRF, LFI, deserialization: sqlmap, XXE Injector, JWT Toolkit, ysoserial, PHPGGC",
    status: "RUNNING",
    tools: ["sec.sqlmap", "sec.oxml_xxe", "sec.xxeinjector", "sec.jwt_tool", "sec.ground_control", "sec.ssrfdetector", "sec.lfisuite", "sec.ysoserial", "sec.phpggc", "sec.race_the_web"],
    commands: ["inject", "exploit", "test", "payload", "extract"],
  },
  {
    id: "sec-bruteforce", name: "BRUTE FORCE & AUTH", category: "offensive",
    icon: "lock-open", color: "#ff9f0a",
    description: "Password brute-forcing: Hydra, patator, changeme",
    status: "RUNNING",
    tools: ["sec.hydra", "sec.patator", "sec.changeme"],
    commands: ["attack", "spray", "crack", "test"],
  },
  {
    id: "sec-mobile", name: "MOBILE SECURITY", category: "offensive",
    icon: "phone", color: "#64d2ff",
    description: "Mobile app analysis: MobSF, Apktool, dex2jar",
    status: "RUNNING",
    tools: ["sec.mobsf", "sec.apktool", "sec.dex2jar"],
    commands: ["analyze", "decompile", "reverse", "report"],
  },
  {
    id: "sec-cms-scan", name: "CMS & WEB APP SCANNING", category: "offensive",
    icon: "shield", color: "#ff6b6b",
    description: "CMS vulnerability scanning: WPScan, CMSMap, CORStest, Retire.js, bfac",
    status: "RUNNING",
    tools: ["sec.wpscan", "sec.cmsmap", "sec.corstest", "sec.retirejs", "sec.bfac"],
    commands: ["scan", "enumerate", "check", "report"],
  },
  {
    id: "sec-exploit-search", name: "EXPLOIT SEARCH", category: "offensive",
    icon: "search", color: "#ff2d55",
    description: "Exploit databases: getsploit, Findsploit",
    status: "RUNNING",
    tools: ["sec.getsploit", "sec.findsploit"],
    commands: ["search", "download", "compile", "test"],
  },
  {
    id: "sec-takeover", name: "SUBDOMAIN TAKEOVER", category: "offensive",
    icon: "link", color: "#ff375f",
    description: "Subdomain takeover: tko-subs, HostileSubBruteforcer",
    status: "RUNNING",
    tools: ["sec.tko_subs", "sec.hostile_sub"],
    commands: ["scan", "verify", "claim", "report"],
  },
  {
    id: "sec-osint", name: "OSINT FRAMEWORK", category: "intel",
    icon: "eye", color: "#5ac8fa",
    description: "OSINT automation: datasploit, WhatsApp-OSINT",
    status: "RUNNING",
    tools: ["sec.datasploit", "sec.whatsapp_osint"],
    commands: ["gather", "analyze", "correlate", "export"],
  },
  {
    id: "sec-extra-repos", name: "EXTRA GITHUB REPOS", category: "repos",
    icon: "folder", color: "#ac8e68",
    description: "Additional tools: Havij, THUDM, ZAI, SaikoHacker, promptfoo, KaliGPT, CVE Zero-Day",
    status: "RUNNING",
    tools: ["sec.havij", "sec.kk12_30", "sec.thudm", "sec.zai_org", "sec.saikohacker", "sec.promptfoo_sec", "sec.alishahid", "sec.kaligpt_sec", "sec.cve_zero_day", "sec.samay825"],
    commands: ["run", "config", "status", "help"],
  },
];

const ALL_MODULES = [...MODULES, ...KIMIKUKIU_MODULES, ...SECURITY_MODULES];

const ModulesContext = createContext<ModulesContextType | undefined>(undefined);

export function ModulesProvider({ children }: { children: React.ReactNode }) {
  const [activeModule, setActiveModule] = useState<Module | null>(ALL_MODULES[0]);

  const getModulesByCategory = useCallback((category: ModuleCategory) => {
    return ALL_MODULES.filter((m) => m.category === category);
  }, []);

  const searchModules = useCallback((query: string) => {
    const lq = query.toLowerCase();
    return ALL_MODULES.filter(
      (m) =>
        m.name.toLowerCase().includes(lq) ||
        m.description.toLowerCase().includes(lq) ||
        m.tools.some((t) => t.toLowerCase().includes(lq)) ||
        m.commands.some((c) => c.toLowerCase().includes(lq))
    );
  }, []);

  const getModuleById = useCallback((id: string) => {
    return ALL_MODULES.find((m) => m.id === id);
  }, []);

  const getRunningModules = useCallback(() => {
    return ALL_MODULES.filter((m) => m.status === "RUNNING");
  }, []);

  const getAllTools = useCallback(() => {
    return ALL_MODULES.flatMap((m) => m.tools);
  }, []);

  return (
    <ModulesContext.Provider
      value={{
        activeModule,
        setActiveModule,
        modules: ALL_MODULES,
        getModulesByCategory,
        searchModules,
        getModuleById,
        getRunningModules,
        getAllTools,
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
