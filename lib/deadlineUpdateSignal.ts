/**
 * Global signal to trigger TaskCard updates when deadline status changes
 * Carries current time to ensure consistent deadline calculations
 */

export interface DeadlineUpdatePayload {
  currentTime: number; // Timestamp when signal was emitted
}

type Listener = (payload: DeadlineUpdatePayload) => void;
const listeners = new Set<Listener>();

export const deadlineUpdateSignal = {
  /**
   * Emit signal to trigger all TaskCard updates
   */
  emit: () => {
    const payload: DeadlineUpdatePayload = {
      currentTime: new Date().getTime(),
    };
    listeners.forEach((listener) => listener(payload));
  },

  /**
   * Subscribe to deadline update signals
   */
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
