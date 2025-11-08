import Dexie, { Table } from 'dexie';

interface OfflineActivity {
  id?: number;
  activityId: string;
  data: any;
  synced: boolean;
  timestamp: Date;
}

interface PendingUpdate {
  id?: number;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  entity: string;
  data: any;
  timestamp: Date;
  retryCount: number;
}

class OfflineDatabase extends Dexie {
  activities!: Table<OfflineActivity, number>;
  pendingUpdates!: Table<PendingUpdate, number>;

  constructor() {
    super('DrywallOfflineDB');

    this.version(1).stores({
      activities: '++id, activityId, synced',
      pendingUpdates: '++id, type, entity, timestamp'
    });
  }

  async addPendingUpdate(update: Omit<PendingUpdate, 'id'>) {
    return await this.pendingUpdates.add(update);
  }

  async syncPendingUpdates() {
    const updates = await this.pendingUpdates.where('retryCount').below(3).toArray();

    for (const update of updates) {
      try {
        const token = localStorage.getItem('auth-token');

        // Attempt to sync with server
        const response = await fetch('/api/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ updates: [update] })
        });

        if (response.ok) {
          // Remove successful update
          await this.pendingUpdates.delete(update.id!);
        } else {
          throw new Error('Sync failed');
        }
      } catch (error) {
        console.error('Sync error:', error);
        // Increment retry count
        await this.pendingUpdates.update(update.id!, {
          retryCount: update.retryCount + 1
        });
      }
    }
  }

  async cacheActivity(activityId: string, data: any) {
    await this.activities.put({
      activityId,
      data,
      synced: true,
      timestamp: new Date()
    });
  }

  async getOfflineActivity(activityId: string) {
    return await this.activities.where('activityId').equals(activityId).first();
  }
}

export const offlineDb = new OfflineDatabase();

// Auto-sync when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Back online - syncing pending updates...');
    offlineDb.syncPendingUpdates();
  });

  // Periodic sync every 5 minutes
  setInterval(() => {
    if (navigator.onLine) {
      offlineDb.syncPendingUpdates();
    }
  }, 5 * 60 * 1000);
}
