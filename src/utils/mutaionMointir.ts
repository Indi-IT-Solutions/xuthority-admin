
/**
 * Mutation Monitor - Tracks and manages mutation states to prevent hanging
 */

interface MutationInfo {
    id: string;
    startTime: number;
    timeout: number;
    cleanup?: () => void;
  }
  
  class MutationMonitor {
    private activeMutations = new Map<string, MutationInfo>();
    private checkInterval: NodeJS.Timeout | null = null;
    private readonly DEFAULT_TIMEOUT = 60000; // 60 seconds max for any mutation
  
    constructor() {
      this.startMonitoring();
    }
  
    /**
     * Register a new mutation
     */
    register(id: string, timeout: number = this.DEFAULT_TIMEOUT, cleanup?: () => void): void {
      this.activeMutations.set(id, {
        id,
        startTime: Date.now(),
        timeout,
        cleanup,
      });
  
      console.log(`🔄 Mutation registered: ${id}`);
    }
  
    /**
     * Mark a mutation as completed
     */
    complete(id: string): void {
      const mutation = this.activeMutations.get(id);
      if (mutation) {
        const duration = Date.now() - mutation.startTime;
        console.log(`✅ Mutation completed: ${id} (${duration}ms)`);
        this.activeMutations.delete(id);
      }
    }
  
    /**
     * Mark a mutation as failed
     */
    fail(id: string, error?: any): void {
      const mutation = this.activeMutations.get(id);
      if (mutation) {
        const duration = Date.now() - mutation.startTime;
        console.log(`❌ Mutation failed: ${id} (${duration}ms)`, error);
        this.activeMutations.delete(id);
      }
    }
  
    /**
     * Force cleanup of a stuck mutation
     */
    forceCleanup(id: string): void {
      const mutation = this.activeMutations.get(id);
      if (mutation) {
        console.warn(`🚨 Force cleaning stuck mutation: ${id}`);
        if (mutation.cleanup) {
          mutation.cleanup();
        }
        this.activeMutations.delete(id);
      }
    }
  
    /**
     * Get all active mutations
     */
    getActiveMutations(): MutationInfo[] {
      return Array.from(this.activeMutations.values());
    }
  
    /**
     * Check for stuck mutations and clean them up
     */
    private checkForStuckMutations(): void {
      const now = Date.now();
      const stuckMutations: string[] = [];
  
      this.activeMutations.forEach((mutation) => {
        const elapsed = now - mutation.startTime;
        if (elapsed > mutation.timeout) {
          stuckMutations.push(mutation.id);
        }
      });
  
      stuckMutations.forEach((id) => {
        console.warn(`⏰ Mutation timeout: ${id}`);
        this.forceCleanup(id);
      });
    }
  
    /**
     * Start monitoring for stuck mutations
     */
    private startMonitoring(): void {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
  
      this.checkInterval = setInterval(() => {
        this.checkForStuckMutations();
      }, 5000); // Check every 5 seconds
    }
  
    /**
     * Stop monitoring
     */
    destroy(): void {
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      this.activeMutations.clear();
    }
  }
  
  // Create a singleton instance
  export const mutationMonitor = new MutationMonitor();
  
  /**
   * Higher-order function to wrap mutations with monitoring
   */
  export const withMutationMonitoring = <T extends (...args: any[]) => Promise<any>>(
    mutationFn: T,
    mutationName: string,
    timeout?: number
  ): T => {
    return (async (...args: any[]) => {
      const mutationId = `${mutationName}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      try {
        mutationMonitor.register(mutationId, timeout);
        const result = await mutationFn(...args);
        mutationMonitor.complete(mutationId);
        return result;
      } catch (error) {
        mutationMonitor.fail(mutationId, error);
        throw error;
      }
    }) as T;
  };
  
  /**
   * Development helper to log active mutations
   */
  export const logActiveMutations = (): void => {
    const active = mutationMonitor.getActiveMutations();
    if (active.length === 0) {
      console.log('📝 No active mutations');
    } else {
      console.table(
        active.map((m) => ({
          id: m.id,
          elapsed: `${Date.now() - m.startTime}ms`,
          timeout: `${m.timeout}ms`,
        }))
      );
    }
  };
  
  // Add global helper for debugging (only in development)
  if (import.meta.env.DEV) {
    (window as any).logMutations = logActiveMutations;
    (window as any).mutationMonitor = mutationMonitor;
  } 