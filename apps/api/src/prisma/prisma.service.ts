import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@gymhub/database';
import {
  logDbConnected,
  logDbDisconnected,
} from '../common/utils/terminal-log';

/** Disconnect Neon after this much idle time (no Prisma queries). */
const NEON_IDLE_DISCONNECT_MS = 5 * 60 * 1000;

type IdleLifecycleState = {
  connected: boolean;
  connectPromise: Promise<void> | null;
  idleTimer: ReturnType<typeof setTimeout> | null;
};

function createNeonPrismaClient() {
  const state: IdleLifecycleState = {
    connected: false,
    connectPromise: null,
    idleTimer: null,
  };

  const base = new PrismaClient();

  function clearIdleTimer(): void {
    if (state.idleTimer) {
      clearTimeout(state.idleTimer);
      state.idleTimer = null;
    }
  }

  function resetIdleTimer(): void {
    clearIdleTimer();
    state.idleTimer = setTimeout(() => {
      void disconnectIdle();
    }, NEON_IDLE_DISCONNECT_MS);
    state.idleTimer.unref?.();
  }

  async function connectWithLog(
    reason: 'startup' | 'reconnect',
  ): Promise<void> {
    if (state.connected) {
      resetIdleTimer();
      return;
    }

    if (state.connectPromise) {
      await state.connectPromise;
      return;
    }

    state.connectPromise = (async () => {
      try {
        await base.$connect();
        // Verify the connection actually reaches Neon before logging success.
        await base.$queryRaw`SELECT 1`;
        state.connected = true;
        if (reason === 'startup') {
          logDbConnected('Database connected successfully (Neon)');
        } else {
          logDbConnected('Database reconnected successfully (Neon)');
        }
        resetIdleTimer();
      } catch (error) {
        state.connected = false;
        logDbDisconnected(
          `Database connection failed: ${error instanceof Error ? error.message : String(error)}`,
        );
        throw error;
      }
    })();

    try {
      await state.connectPromise;
    } finally {
      state.connectPromise = null;
    }
  }

  async function ensureConnected(): Promise<void> {
    if (state.connected) {
      resetIdleTimer();
      return;
    }
    await connectWithLog('reconnect');
  }

  async function disconnectIdle(): Promise<void> {
    if (!state.connected) return;
    clearIdleTimer();
    try {
      await base.$disconnect();
      state.connected = false;
      logDbDisconnected(
        'Database disconnected (idle 5 min). Next API call will reconnect.',
      );
    } catch (error) {
      logDbDisconnected(
        `Database idle disconnect failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async function disconnectShutdown(): Promise<void> {
    clearIdleTimer();
    if (!state.connected) return;
    await base.$disconnect();
    state.connected = false;
    logDbDisconnected('Database disconnected (app shutdown)');
  }

  return base.$extends({
    client: {
      $neonConnectStartup() {
        return connectWithLog('startup');
      },
      $neonDisconnectShutdown() {
        return disconnectShutdown();
      },
    },
    query: {
      async $allOperations({
        args,
        query,
      }: {
        args: unknown;
        query: (args: unknown) => Promise<unknown>;
      }) {
        await ensureConnected();
        return query(args);
      },
    },
  });
}

const ExtendedNeonPrismaClient = class {
  constructor() {
    return createNeonPrismaClient();
  }
} as unknown as new () => ReturnType<typeof createNeonPrismaClient>;

@Injectable()
export class PrismaService extends ExtendedNeonPrismaClient {}
