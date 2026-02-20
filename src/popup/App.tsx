import React, { useState, useEffect } from 'react';
import { Subscription } from '../types';
import { Storage } from '../utils/storage';
import { daysUntilRenewal, getRiskLevel, formatDate } from '../utils/detector';

export const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'trials' | 'active'>('all');
  const [monthlyBurnRate, setMonthlyBurnRate] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const subs = await Storage.getSubscriptions();
    const burnRate = await Storage.calculateMonthlyBurnRate();
    
    // Sort by renewal date
    subs.sort((a, b) => new Date(a.renewalDate).getTime() - new Date(b.renewalDate).getTime());
    
    setSubscriptions(subs);
    setMonthlyBurnRate(burnRate);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to remove this subscription?')) {
      await Storage.deleteSubscription(id);
      await loadData();
    }
  };

  const handleMarkCancelled = async (id: string) => {
    await Storage.updateSubscription(id, { status: 'cancelled' });
    await loadData();
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    if (activeTab === 'trials') return sub.status === 'trial';
    if (activeTab === 'active') return sub.status === 'active';
    return sub.status !== 'cancelled' && sub.status !== 'expired';
  });

  const annualProjection = Math.round(monthlyBurnRate * 12);
  const activeCount = subscriptions.filter(s => s.status === 'active' || s.status === 'trial').length;
  const trialCount = subscriptions.filter(s => s.status === 'trial').length;

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerTitle}>
          <span style={styles.icon}>🛡️</span>
          <h1 style={styles.title}>Subscription Guardian</h1>
        </div>
        <div style={styles.subtitle}>Your personal subscription watchdog</div>
      </div>

      {/* Summary Cards */}
      <div style={styles.summaryGrid}>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Active</div>
          <div style={styles.summaryValue}>{activeCount}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Trials</div>
          <div style={styles.summaryValue}>{trialCount}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Monthly</div>
          <div style={styles.summaryValue}>${monthlyBurnRate}</div>
        </div>
        <div style={styles.summaryCard}>
          <div style={styles.summaryLabel}>Annual</div>
          <div style={styles.summaryValue}>${annualProjection}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={activeTab === 'all' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          style={activeTab === 'trials' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('trials')}
        >
          Trials
        </button>
        <button
          style={activeTab === 'active' ? styles.tabActive : styles.tab}
          onClick={() => setActiveTab('active')}
        >
          Active
        </button>
      </div>

      {/* Subscriptions List */}
      <div style={styles.listContainer}>
        {filteredSubscriptions.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>�️</div>
            <div style={styles.emptyTitle}>No subscriptions tracked yet</div>
            <div style={styles.emptyText}>
              Click any "Subscribe" or "Start Trial" button on a website and Guardian will pop up to track it — just like a password manager.
            </div>
          </div>
        ) : (
          filteredSubscriptions.map(sub => (
            <SubscriptionCard
              key={sub.id}
              subscription={sub}
              onDelete={handleDelete}
              onMarkCancelled={handleMarkCancelled}
            />
          ))
        )}
      </div>
    </div>
  );
};

interface SubscriptionCardProps {
  subscription: Subscription;
  onDelete: (id: string) => void;
  onMarkCancelled: (id: string) => void;
}

const SubscriptionCard: React.FC<SubscriptionCardProps> = ({
  subscription,
  onDelete,
  onMarkCancelled
}) => {
  const daysLeft = daysUntilRenewal(subscription.renewalDate);
  const riskLevel = getRiskLevel(subscription.riskScore);
  const isUrgent = daysLeft <= 2 && daysLeft >= 0;
  
  const riskColors = {
    Low: '#10b981',
    Moderate: '#f59e0b',
    High: '#ef4444'
  };

  return (
    <div style={{
      ...styles.card,
      ...(isUrgent ? styles.cardUrgent : {})
    }}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.serviceName}>{subscription.serviceName}</div>
          <div style={styles.cardMeta}>
            {subscription.status === 'trial' && (
              <span style={styles.trialBadge}>FREE TRIAL</span>
            )}
            <span style={{
              ...styles.riskBadge,
              background: riskColors[riskLevel]
            }}>
              {riskLevel} Risk
            </span>
          </div>
        </div>
        <div style={styles.price}>
          {subscription.currency === 'USD' ? '$' : subscription.currency}
          {subscription.price}
          <span style={styles.priceFrequency}>/{subscription.billingCycle}</span>
        </div>
      </div>

      <div style={styles.cardDivider} />

      <div style={styles.cardBody}>
        <div style={styles.infoRow}>
          <span style={styles.infoLabel}>
            {subscription.status === 'trial' ? 'Trial Ends' : 'Next Renewal'}
          </span>
          <span style={styles.infoValue}>
            {formatDate(subscription.renewalDate)}
          </span>
        </div>
        
        {daysLeft >= 0 && (
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Days Remaining</span>
            <span style={{
              ...styles.infoValue,
              color: isUrgent ? '#ef4444' : '#6b7280',
              fontWeight: isUrgent ? 600 : 400
            }}>
              {daysLeft} day{daysLeft !== 1 ? 's' : ''}
              {isUrgent && ' ⚠️'}
            </span>
          </div>
        )}

        {subscription.darkPatterns.length > 0 && (
          <div style={styles.warningBox}>
            ⚠️ Dark patterns detected: {subscription.darkPatterns.slice(0, 2).join(', ')}
          </div>
        )}
      </div>

      <div style={styles.cardActions}>
        <button
          style={styles.btnSecondary}
          onClick={() => window.open(subscription.url, '_blank')}
        >
          Visit Site
        </button>
        {subscription.status !== 'cancelled' && (
          <button
            style={styles.btnPrimary}
            onClick={() => onMarkCancelled(subscription.id)}
          >
            Mark Cancelled
          </button>
        )}
        <button
          style={styles.btnDanger}
          onClick={() => onDelete(subscription.id)}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: 600,
    minHeight: 400,
    maxHeight: 600,
    overflow: 'auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: '#f9fafb',
  },
  loading: {
    padding: 40,
    textAlign: 'center',
    color: '#6b7280',
  },
  header: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: 20,
    color: 'white',
  },
  headerTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  icon: {
    fontSize: 24,
  },
  title: {
    margin: 0,
    fontSize: 20,
    fontWeight: 600,
  },
  subtitle: {
    fontSize: 13,
    opacity: 0.9,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 12,
    padding: 16,
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
  },
  summaryCard: {
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    color: '#6b7280',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1f2937',
  },
  tabs: {
    display: 'flex',
    background: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '0 16px',
  },
  tab: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    background: 'transparent',
    color: '#6b7280',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    borderBottom: '2px solid transparent',
  },
  tabActive: {
    flex: 1,
    padding: '12px 0',
    border: 'none',
    background: 'transparent',
    color: '#667eea',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    borderBottom: '2px solid #667eea',
  },
  listContainer: {
    padding: 16,
  },
  empty: {
    textAlign: 'center',
    padding: 40,
    color: '#6b7280',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
  },
  card: {
    background: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    border: '1px solid #e5e7eb',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
  },
  cardUrgent: {
    border: '2px solid #ef4444',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1f2937',
    marginBottom: 6,
  },
  cardMeta: {
    display: 'flex',
    gap: 6,
  },
  trialBadge: {
    display: 'inline-block',
    background: '#dbeafe',
    color: '#1e40af',
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  riskBadge: {
    display: 'inline-block',
    color: 'white',
    fontSize: 10,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 24,
    fontWeight: 700,
    color: '#1f2937',
  },
  priceFrequency: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 400,
  },
  cardDivider: {
    height: 1,
    background: '#e5e7eb',
    margin: '12px 0',
  },
  cardBody: {
    marginBottom: 12,
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 13,
  },
  infoLabel: {
    color: '#6b7280',
  },
  infoValue: {
    color: '#374151',
    fontWeight: 500,
  },
  warningBox: {
    background: '#fef3c7',
    border: '1px solid #fcd34d',
    borderRadius: 6,
    padding: 8,
    fontSize: 12,
    color: '#92400e',
    marginTop: 8,
  },
  cardActions: {
    display: 'flex',
    gap: 8,
  },
  btnPrimary: {
    flex: 1,
    padding: '8px 12px',
    background: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnSecondary: {
    flex: 1,
    padding: '8px 12px',
    background: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  btnDanger: {
    padding: '8px 12px',
    background: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  }
};
