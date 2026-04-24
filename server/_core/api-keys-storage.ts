/**
 * API Keys Storage
 * Persistent storage for LLM provider API keys
 */

interface APIKeyEntry {
  id: string;
  provider: string;
  apiKey: string;
  modelId?: string;
  isActive: boolean;
  priority: number;
  lastValidated: Date;
}

class APIKeyStore {
  private keys: Map<string, APIKeyEntry> = new Map();

  /**
   * Add API key
   */
  addKey(
    provider: string,
    apiKey: string,
    modelId?: string,
    priority: number = 5
  ): string {
    const id = `${provider}-${Date.now()}`;
    this.keys.set(id, {
      id,
      provider,
      apiKey,
      modelId,
      isActive: true,
      priority,
      lastValidated: new Date(),
    });
    return id;
  }

  /**
   * Get all keys
   */
  getAllKeys(): APIKeyEntry[] {
    return Array.from(this.keys.values());
  }

  /**
   * Get active keys sorted by priority
   */
  getActiveKeys(): APIKeyEntry[] {
    return Array.from(this.keys.values())
      .filter((k) => k.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Get keys by provider
   */
  getKeysByProvider(provider: string): APIKeyEntry[] {
    return Array.from(this.keys.values())
      .filter((k) => k.provider.toLowerCase() === provider.toLowerCase() && k.isActive)
      .sort((a, b) => b.priority - a.priority);
  }

  /**
   * Update key status
   */
  updateKeyStatus(id: string, isActive: boolean): boolean {
    const key = this.keys.get(id);
    if (!key) return false;
    key.isActive = isActive;
    return true;
  }

  /**
   * Update key priority
   */
  updateKeyPriority(id: string, priority: number): boolean {
    const key = this.keys.get(id);
    if (!key) return false;
    key.priority = priority;
    return true;
  }

  /**
   * Delete key
   */
  deleteKey(id: string): boolean {
    return this.keys.delete(id);
  }

  /**
   * Clear all keys
   */
  clearAllKeys(): void {
    this.keys.clear();
  }

  /**
   * Get key count
   */
  getKeyCount(): number {
    return this.keys.size;
  }

  /**
   * Get active key count
   */
  getActiveKeyCount(): number {
    return Array.from(this.keys.values()).filter((k) => k.isActive).length;
  }

  /**
   * Get unique providers
   */
  getProviders(): string[] {
    return [...new Set(Array.from(this.keys.values()).map((k) => k.provider))];
  }

  /**
   * Check if has active keys
   */
  hasActiveKeys(): boolean {
    return this.getActiveKeyCount() > 0;
  }
}

// Export singleton instance
export const apiKeyStore = new APIKeyStore();
