import { Subscription } from '../types';

const STORAGE_KEYS = {
  SUBSCRIPTIONS: 'subscriptions',
};

/**
 * Chrome storage utility — clean and minimal.
 */
export class Storage {
  static async getSubscriptions(): Promise<Subscription[]> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEYS.SUBSCRIPTIONS);
      return result[STORAGE_KEYS.SUBSCRIPTIONS] || [];
    } catch (error) {
      console.error('Error getting subscriptions:', error);
      return [];
    }
  }

  static async addSubscription(subscription: Subscription): Promise<void> {
    const subs = await this.getSubscriptions();
    subs.push(subscription);
    await chrome.storage.local.set({ [STORAGE_KEYS.SUBSCRIPTIONS]: subs });
  }

  static async updateSubscription(id: string, updates: Partial<Subscription>): Promise<void> {
    const subs = await this.getSubscriptions();
    const idx = subs.findIndex(s => s.id === id);
    if (idx !== -1) {
      subs[idx] = { ...subs[idx], ...updates };
      await chrome.storage.local.set({ [STORAGE_KEYS.SUBSCRIPTIONS]: subs });
    }
  }

  static async deleteSubscription(id: string): Promise<void> {
    const subs = await this.getSubscriptions();
    await chrome.storage.local.set({
      [STORAGE_KEYS.SUBSCRIPTIONS]: subs.filter(s => s.id !== id),
    });
  }

  static async calculateMonthlyBurnRate(): Promise<number> {
    const subs = await this.getSubscriptions();
    let total = 0;
    for (const sub of subs) {
      if (sub.status === 'cancelled' || sub.status === 'expired') continue;
      if (sub.billingCycle === 'monthly') total += sub.price;
      else if (sub.billingCycle === 'yearly') total += sub.price / 12;
      else if (sub.billingCycle === 'weekly') total += sub.price * 4.33;
    }
    return Math.round(total * 100) / 100;
  }
}
