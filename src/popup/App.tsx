import React, { useState, useEffect } from 'react';
import { Subscription } from '../types';
import { Storage } from '../utils/storage';
import { daysUntilRenewal, getRiskLevel, formatDate } from '../utils/detector';

const defaultForm = () => {
  const today = new Date();
  const renewal = new Date(today);
  renewal.setMonth(renewal.getMonth() + 1);
  return {
    serviceName: '',
    url: '',
    price: '',
    billingCycle: 'monthly' as 'weekly' | 'monthly' | 'yearly',
    status: 'active' as 'active' | 'trial',
    renewalDate: renewal.toISOString().split('T')[0],
  };
};

export const App: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'trials' | 'active'>('all');
  const [monthlyBurnRate, setMonthlyBurnRate] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [form, setForm] = useState(defaultForm());
  const [formError, setFormError] = useState('');

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

  const openAddModal = () => {
    setForm(defaultForm());
    setFormError('');
    setShowAddModal(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm(prev => {
      const next = { ...prev, [field]: value };
      // Auto-update renewal date when billing cycle changes
      if (field === 'billingCycle') {
        const now = new Date();
        if (value === 'yearly')  now.setFullYear(now.getFullYear() + 1);
        else if (value === 'weekly') now.setDate(now.getDate() + 7);
        else now.setMonth(now.getMonth() + 1);
        next.renewalDate = now.toISOString().split('T')[0];
      }
      return next;
    });
  };

  const handleAddManually = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.serviceName.trim()) { setFormError('Service name is required'); return; }
    if (!form.price || isNaN(parseFloat(form.price))) { setFormError('Enter a valid price'); return; }

    const subscription: Subscription = {
      id: 'sub_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 8),
      userId: 'default',
      serviceName: form.serviceName.trim(),
      url: form.url.trim() || window.location.href,
      price: parseFloat(form.price),
      currency: 'USD',
      billingCycle: form.billingCycle,
      status: form.status,
      renewalDate: new Date(form.renewalDate).toISOString(),
      startDate: new Date().toISOString(),
      trialLength: form.status === 'trial' ? Math.ceil((new Date(form.renewalDate).getTime() - Date.now()) / 86400000) : undefined,
      riskScore: 20,
      darkPatterns: [],
      createdAt: new Date().toISOString(),
    };

    await Storage.addSubscription(subscription);
    await loadData();
    setShowAddModal(false);
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

      {/* Add Manual Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <span style={{ fontWeight: 700, fontSize: 15 }}>➕ Add Subscription Manually</span>
              <button onClick={() => setShowAddModal(false)} style={styles.modalClose}>✕</button>
            </div>

            <form onSubmit={handleAddManually} style={{ margin: 0 }}>
              {formError && (
                <div style={styles.formError}>{formError}</div>
              )}

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Service Name *</label>
                <input
                  style={styles.formInput}
                  type="text"
                  placeholder="e.g. Netflix, Spotify"
                  value={form.serviceName}
                  onChange={e => handleFormChange('serviceName', e.target.value)}
                  required
                  autoFocus
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.formLabel}>Website URL</label>
                <input
                  style={styles.formInput}
                  type="url"
                  placeholder="https://netflix.com"
                  value={form.url}
                  onChange={e => handleFormChange('url', e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                <div>
                  <label style={styles.formLabel}>Price (USD) *</label>
                  <input
                    style={styles.formInput}
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="9.99"
                    value={form.price}
                    onChange={e => handleFormChange('price', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label style={styles.formLabel}>Billing Cycle</label>
                  <select
                    style={styles.formInput}
                    value={form.billingCycle}
                    onChange={e => handleFormChange('billingCycle', e.target.value)}
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
                <div>
                  <label style={styles.formLabel}>Status</label>
                  <select
                    style={styles.formInput}
                    value={form.status}
                    onChange={e => handleFormChange('status', e.target.value)}
                  >
                    <option value="active">Active</option>
                    <option value="trial">Free Trial</option>
                  </select>
                </div>
                <div>
                  <label style={styles.formLabel}>Next Renewal</label>
                  <input
                    style={styles.formInput}
                    type="date"
                    value={form.renewalDate}
                    onChange={e => handleFormChange('renewalDate', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button type="submit" style={styles.btnPrimary}>🛡️ Add Subscription</button>
                <button type="button" style={styles.btnSecondary} onClick={() => setShowAddModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

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
        <button
          style={styles.addBtn}
          onClick={openAddModal}
          title="Add subscription manually"
        >
          + Add
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
            <button style={{ ...styles.btnPrimary, marginTop: 16, padding: '10px 20px' }} onClick={openAddModal}>
              ➕ Add Manually
            </button>
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
  },
  addBtn: {
    marginLeft: 'auto',
    padding: '8px 14px',
    background: 'linear-gradient(135deg, #667eea, #764ba2)',
    color: 'white',
    border: 'none',
    borderRadius: 6,
    fontSize: 13,
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'center',
  },
  modalOverlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'flex-end',
  },
  modal: {
    width: '100%',
    background: 'white',
    borderRadius: '14px 14px 0 0',
    padding: 20,
    boxShadow: '0 -8px 30px rgba(0,0,0,0.2)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    color: '#9ca3af',
    padding: 0,
  },
  formGroup: {
    marginBottom: 12,
  },
  formLabel: {
    display: 'block',
    fontSize: 11,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 4,
    textTransform: 'uppercase' as const,
  },
  formInput: {
    width: '100%',
    padding: '8px 10px',
    border: '1px solid #e5e7eb',
    borderRadius: 7,
    fontSize: 13,
    boxSizing: 'border-box' as const,
    outline: 'none',
    background: 'white',
  },
  formError: {
    background: '#fef2f2',
    border: '1px solid #fca5a5',
    color: '#991b1b',
    fontSize: 12,
    padding: '8px 10px',
    borderRadius: 6,
    marginBottom: 12,
  },
};
