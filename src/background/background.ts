import { Storage } from '../utils/storage';
import { Subscription } from '../types';

console.log('🛡️ Subscription Guardian — Background Service Worker');

// ============================================================
// INSTALL
// ============================================================
chrome.runtime.onInstalled.addListener(async () => {
  console.log('Extension installed');

  // Hourly alarm to check upcoming renewals
  chrome.alarms.create('checkRenewals', { periodInMinutes: 60 });

  chrome.notifications.create('welcome', {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: 'Subscription Guardian Active 🛡️',
    message: 'Click any subscription button on any website and we\'ll help you track it!',
  });
});

// ============================================================
// MESSAGE HANDLING (from content script & popup)
// ============================================================
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SUBSCRIPTION_DETECTED') {
    // Show badge on tab
    if (sender.tab?.id) {
      chrome.action.setBadgeText({ text: '!', tabId: sender.tab.id });
      chrome.action.setBadgeBackgroundColor({ color: '#667eea', tabId: sender.tab.id });
    }
    sendResponse({ success: true });
  }

  if (message.type === 'ADD_SUBSCRIPTION') {
    handleAddSubscription(message.data).then(() => sendResponse({ success: true }));
    return true; // async
  }

  if (message.type === 'GET_SUBSCRIPTIONS') {
    Storage.getSubscriptions().then(subs => sendResponse({ subscriptions: subs }));
    return true;
  }

  if (message.type === 'DELETE_SUBSCRIPTION') {
    Storage.deleteSubscription(message.id).then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'UPDATE_SUBSCRIPTION') {
    Storage.updateSubscription(message.id, message.updates).then(() => sendResponse({ success: true }));
    return true;
  }
});

// ============================================================
// ADD SUBSCRIPTION + SCHEDULE NOTIFICATIONS
// ============================================================
async function handleAddSubscription(subscription: Subscription) {
  await Storage.addSubscription(subscription);
  scheduleReminder(subscription);

  chrome.notifications.create(`added_${subscription.id}`, {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: '✅ Subscription Tracked!',
    message: `Now tracking "${subscription.serviceName}". You'll get a reminder 1 day before renewal.`,
  });
}

/**
 * Schedule a reminder alarm 24 hours before the renewal date.
 */
function scheduleReminder(sub: Subscription) {
  const renewalMs = new Date(sub.renewalDate).getTime();
  const oneDayBefore = renewalMs - 24 * 60 * 60 * 1000;

  if (oneDayBefore > Date.now()) {
    chrome.alarms.create(`remind_${sub.id}`, { when: oneDayBefore });
    console.log(`⏰ Reminder set for ${sub.serviceName} at ${new Date(oneDayBefore).toLocaleString()}`);
  }
}

// ============================================================
// ALARM HANDLER
// ============================================================
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'checkRenewals') {
    await checkAllRenewals();
    return;
  }

  // Individual subscription reminder
  if (alarm.name.startsWith('remind_')) {
    const subId = alarm.name.replace('remind_', '');
    await sendRenewalNotification(subId);
  }
});

/**
 * Hourly check: find any subscriptions renewing within 24h
 * that haven't been notified yet (safety net).
 */
async function checkAllRenewals() {
  const subs = await Storage.getSubscriptions();
  const now = Date.now();

  for (const sub of subs) {
    if (sub.status === 'cancelled' || sub.status === 'expired') continue;

    const renewalMs = new Date(sub.renewalDate).getTime();
    const hoursLeft = (renewalMs - now) / (1000 * 60 * 60);

    // Within 24 hours and not yet notified
    if (hoursLeft > 0 && hoursLeft <= 24 && !sub.notificationSent) {
      await sendRenewalNotification(sub.id);
    }

    // Expired trial → mark active
    if (renewalMs < now && sub.status === 'trial') {
      await Storage.updateSubscription(sub.id, { status: 'active' });
    }
  }
}

/**
 * Send the actual renewal notification.
 */
async function sendRenewalNotification(subId: string) {
  const subs = await Storage.getSubscriptions();
  const sub = subs.find(s => s.id === subId);
  if (!sub) return;

  const symbol = sub.currency === 'EUR' ? '€' : sub.currency === 'GBP' ? '£' : '$';
  const label = sub.status === 'trial' ? 'trial ends' : 'subscription renews';

  chrome.notifications.create(`renewal_${sub.id}`, {
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: `⏰ ${sub.serviceName} — Renews Tomorrow!`,
    message: `Your ${label} tomorrow. You'll be charged ${symbol}${sub.price}/${sub.billingCycle}. Cancel now if you don't want to continue.`,
    priority: 2,
  });

  await Storage.updateSubscription(sub.id, { notificationSent: true });
  console.log(`🔔 Renewal notification sent for ${sub.serviceName}`);
}

// ============================================================
// RE-SCHEDULE ALL REMINDERS ON BROWSER START
// ============================================================
chrome.runtime.onStartup.addListener(async () => {
  console.log('Browser started — re-scheduling reminders');
  const subs = await Storage.getSubscriptions();
  for (const sub of subs) {
    if (sub.status !== 'cancelled' && sub.status !== 'expired') {
      scheduleReminder(sub);
    }
  }
});
