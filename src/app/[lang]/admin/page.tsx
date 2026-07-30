"use client";
import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAuthenticated(true);
      fetchOrders();
    } else {
      alert("كلمة المرور غير صحيحة");
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      // Reverse orders to show newest first
      if (data.orders) {
        setOrders(data.orders.reverse());
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
    setLoading(false);
  };

  const updateStatus = async (orderIds: string[], status: string) => {
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, status })
      });
      if (res.ok) {
        // Update local state
        setOrders(orders.map(o => 
          orderIds.includes(o['Order ID']) ? { ...o, Status: status } : o
        ));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const markAllProcessed = () => {
    const newOrderIds = orders.filter(o => o.Status === 'New').map(o => o['Order ID']);
    if (newOrderIds.length > 0) {
      updateStatus(newOrderIds, 'Processed');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.loginContainer} dir="rtl">
        <div className={styles.loginCard}>
          <h2>لوحة تحكم المتجر</h2>
          <form onSubmit={handleLogin}>
            <input 
              type="password" 
              placeholder="أدخل كلمة المرور" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={styles.loginInput}
            />
            <button type="submit" className={styles.loginBtn}>تسجيل الدخول</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <h1 className={styles.title}>الطلبات الواردة</h1>
            <button onClick={markAllProcessed} className={styles.secondaryBtn}>
              تحديد الكل كـ مقروء ✓
            </button>
          </div>
          <a href="/api/orders/export" className={styles.exportBtn} download>
            <span>📥</span> تحميل ملف إكسيل
          </a>
        </div>

        <div className={styles.statsContainer}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>إجمالي الطلبات</span>
            <span className={styles.statValue}>{orders.length}</span>
          </div>
          <div className={`${styles.statCard} ${styles.new}`}>
            <span className={styles.statLabel}>الطلبات الجديدة</span>
            <span className={styles.statValue}>{orders.filter(o => o['Status'] === 'New').length}</span>
          </div>
          <div className={`${styles.statCard} ${styles.processed}`}>
            <span className={styles.statLabel}>تم التسليم (مقروء)</span>
            <span className={styles.statValue}>{orders.filter(o => o['Status'] === 'Processed').length}</span>
          </div>
        </div>

        <div className={styles.card}>
          {loading ? (
            <div className={styles.loading}>جاري تحميل الطلبات...</div>
          ) : orders.length === 0 ? (
            <div className={styles.emptyState}>لا توجد طلبات حتى الآن.</div>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>التاريخ / الوقت</th>
                    <th>اسم العميل</th>
                    <th>رقم الموبايل</th>
                    <th>العنوان</th>
                    <th>المنتجات المطلوبة</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={idx} className={order['Status'] === 'Processed' ? styles.processedRow : ''}>
                      <td className={styles.orderId}>{order['Order ID'] || '-'}</td>
                      <td>{order['Date']} <br/> <small style={{color: '#888'}}>{order['Time']}</small></td>
                      <td>{order['Customer Name']}</td>
                      <td dir="ltr" style={{textAlign: 'right'}}>{order['Phone']}</td>
                      <td>{order['Address']}</td>
                      <td className={styles.itemsCol}>
                        {order['Items'] ? order['Items'].split(' | ').map((item: string, i: number) => (
                          <div key={i}>• {item}</div>
                        )) : '-'}
                      </td>
                      <td className={styles.totalCol}>{order['Total']} ج.م</td>
                      <td>
                        <span className={`${styles.statusBadge} ${order['Status'] === 'Processed' ? styles.badgeProcessed : ''}`}>
                          {order['Status'] === 'Processed' ? 'تم' : 'جديد'}
                        </span>
                      </td>
                      <td>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={order['Status'] === 'Processed'}
                            onChange={(e) => updateStatus([order['Order ID']], e.target.checked ? 'Processed' : 'New')}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
