import { useEffect, useState } from 'react'
import './App.css'

interface SummaryData {
  generated_at: string
  sms_stats: {
    total: number
    processed: number
    financial: number
    pending: number
  }
  transaction_stats: {
    total: number
    debit_count: number
    credit_count: number
  }
  totals: {
    total_spent: number
    total_received: number
    net_flow: number
  }
  period_spending: {
    today: number
    this_week: number
    this_month: number
    average_daily: number
  }
  top_merchants: Array<{
    name: string
    total: number
    transactions: number
  }>
  category_breakdown: Array<{
    name: string
    icon: string
    total: number
    transactions: number
  }>
  recent_transactions: Array<{
    id: number
    type: string
    amount: number
    date: string
    merchant_id: number
    description: string
  }>
}

function App() {
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary()
  }, [])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:8000/api/summary')
      if (!response.ok) throw new Error('Failed to fetch summary')
      const data = await response.json()
      setSummary(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading your financial data...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchSummary}>Retry</button>
      </div>
    )
  }

  if (!summary) return null

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Personal Finance Dashboard</h1>
        <p className="subtitle">SMS-based spending analysis</p>
      </header>

      <main className="dashboard">
        {/* Stats Overview */}
        <section className="stats-grid">
          <div className="stat-card spent">
            <span className="stat-icon">📉</span>
            <div className="stat-content">
              <h3>Total Spent</h3>
              <p className="stat-value">{formatCurrency(summary.totals.total_spent)}</p>
              <span className="stat-count">{summary.transaction_stats.debit_count} transactions</span>
            </div>
          </div>

          <div className="stat-card received">
            <span className="stat-icon">📈</span>
            <div className="stat-content">
              <h3>Total Received</h3>
              <p className="stat-value">{formatCurrency(summary.totals.total_received)}</p>
              <span className="stat-count">{summary.transaction_stats.credit_count} transactions</span>
            </div>
          </div>

          <div className="stat-card net">
            <span className="stat-icon">💵</span>
            <div className="stat-content">
              <h3>Net Flow</h3>
              <p className={`stat-value ${summary.totals.net_flow >= 0 ? 'positive' : 'negative'}`}>
                {formatCurrency(summary.totals.net_flow)}
              </p>
              <span className="stat-count">{summary.transaction_stats.total} total transactions</span>
            </div>
          </div>

          <div className="stat-card sms">
            <span className="stat-icon">📱</span>
            <div className="stat-content">
              <h3>SMS Processed</h3>
              <p className="stat-value">{summary.sms_stats.processed}</p>
              <span className="stat-count">{summary.sms_stats.financial} financial</span>
            </div>
          </div>
        </section>

        {/* Period Spending */}
        <section className="period-section">
          <h2>📅 Spending by Period</h2>
          <div className="period-grid">
            <div className="period-card">
              <h4>Today</h4>
              <p>{formatCurrency(summary.period_spending.today)}</p>
            </div>
            <div className="period-card">
              <h4>This Week</h4>
              <p>{formatCurrency(summary.period_spending.this_week)}</p>
            </div>
            <div className="period-card">
              <h4>This Month</h4>
              <p>{formatCurrency(summary.period_spending.this_month)}</p>
            </div>
            <div className="period-card">
              <h4>Daily Average</h4>
              <p>{formatCurrency(summary.period_spending.average_daily)}</p>
            </div>
          </div>
        </section>

        <div className="two-columns">
          {/* Top Merchants */}
          <section className="merchants-section">
            <h2>🏪 Top Merchants</h2>
            <div className="merchants-list">
              {summary.top_merchants.map((merchant, index) => (
                <div key={index} className="merchant-item">
                  <div className="merchant-rank">#{index + 1}</div>
                  <div className="merchant-info">
                    <h4>{merchant.name}</h4>
                    <span>{merchant.transactions} transactions</span>
                  </div>
                  <div className="merchant-amount">{formatCurrency(merchant.total)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Category Breakdown */}
          <section className="categories-section">
            <h2>📊 Category Breakdown</h2>
            <div className="categories-list">
              {summary.category_breakdown.map((category, index) => (
                <div key={index} className="category-item">
                  <div className="category-icon">{category.icon}</div>
                  <div className="category-info">
                    <h4>{category.name}</h4>
                    <span>{category.transactions} transactions</span>
                  </div>
                  <div className="category-amount">{formatCurrency(category.total)}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Recent Transactions */}
        <section className="transactions-section">
          <h2>📋 Recent Transactions</h2>
          <div className="transactions-table-container">
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {summary.recent_transactions.map((txn) => (
                  <tr key={txn.id}>
                    <td>{formatDate(txn.date)}</td>
                    <td>
                      <span className={`txn-type ${txn.type}`}>
                        {txn.type === 'debit' ? '↓' : '↑'} {txn.type}
                      </span>
                    </td>
                    <td className={txn.type === 'debit' ? 'amount-debit' : 'amount-credit'}>
                      {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                    </td>
                    <td>{txn.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="footer">
          <p>Last updated: {formatDate(summary.generated_at)}</p>
          <button onClick={fetchSummary} className="refresh-btn">
            🔄 Refresh
          </button>
        </footer>
      </main>
    </div>
  )
}

export default App
