export interface Subscription {
  id: string;
  userId: string;
  serviceName: string;
  url: string;
  trialLength?: number; // in days
  startDate: string;    // ISO date
  renewalDate: string;  // ISO date
  price: number;
  currency: string;
  billingCycle: 'daily' | 'weekly' | 'monthly' | 'yearly';
  riskScore: number;    // 0-100
  status: 'trial' | 'active' | 'cancelled' | 'expired';
  darkPatterns: string[];
  createdAt: string;
  notificationSent?: boolean;
}

export interface DetectionResult {
  isSubscriptionPage: boolean;
  trialDetected: boolean;
  trialLength?: number;
  price?: number;
  currency?: string;
  billingCycle?: string;
  riskScore: number;
  darkPatterns: string[];
  keywords: string[];
  serviceName?: string;
}
