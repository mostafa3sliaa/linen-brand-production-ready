"use client";
import { useState, useEffect } from 'react';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);

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
          orderIds.includes(o['رقم الطلب']) ? { ...o, 'الحالة': status } : o
        ));
      }
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const markAllProcessed = () => {
    const newOrderIds = orders.filter(o => o['الحالة'] === 'New').map(o => o['رقم الطلب']);
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
            <span className={styles.statValue}>{orders.filter(o => o['الحالة'] === 'New').length}</span>
          </div>
          <div className={`${styles.statCard} ${styles.processed}`}>
            <span className={styles.statLabel}>تم التسليم (مقروء)</span>
            <span className={styles.statValue}>{orders.filter(o => o['الحالة'] === 'Processed').length}</span>
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
                    <th>التاريخ والوقت</th>
                    <th>اسم العميل</th>
                    <th>رقم الموبايل</th>
                    <th>العنوان التفصيلي</th>
                    <th>المنتجات المطلوبة</th>
                    <th>سعر المنتجات</th>
                    <th>الشحن</th>
                    <th>الإجمالي الكلي</th>
                    <th>ملاحظات</th>
                    <th>الحالة</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={idx} className={order['الحالة'] === 'Processed' ? styles.processedRow : ''}>
                      <td>{order['التاريخ والوقت']}</td>
                      <td>{order['اسم العميل']}</td>
                      <td dir="ltr" style={{textAlign: 'right'}}>{order['رقم الهاتف']}</td>
                      <td>{order['العنوان التفصيلي']}</td>
                      <td className={styles.itemsCol}>
                        {order['المنتجات']}
                      </td>
                      <td>{order['إجمالي المنتجات']} ج.م</td>
                      <td>{order['مصاريف الشحن']} ج.م</td>
                      <td className={styles.totalCol}>{order['الإجمالي الكلي']} ج.م</td>
                      <td>{order['ملاحظات']}</td>
                      <td>
                        <span className={`${styles.statusBadge} ${order['الحالة'] === 'Processed' ? styles.badgeProcessed : ''}`}>
                          {order['الحالة'] === 'Processed' ? 'تم' : 'جديد'}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actionCell}>
                          <label className={styles.switch}>
                            <input 
                              type="checkbox" 
                              checked={order['الحالة'] === 'Processed'}
                              onChange={(e) => updateStatus([order['رقم الطلب']], e.target.checked ? 'Processed' : 'New')}
                            />
                            <span className={styles.slider}></span>
                          </label>
                          <button onClick={() => setViewOrder(order)} className={styles.iconBtn} title="عرض ونسخ">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Order Preview Modal */}
      {viewOrder && (
        <div className={styles.modalOverlay} onClick={() => setViewOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>تفاصيل الطلب</h3>
              <button className={styles.closeBtn} onClick={() => {
                setViewOrder(null);
                setCopied(false);
              }}>×</button>
            </div>
            
            <div className={styles.orderPreviewBox}>
              {`الاسم: ${viewOrder['اسم العميل']}\nالموبايل: ${viewOrder['رقم الهاتف']}\nالمحافظة: ${viewOrder['المحافظة']}\nالعنوان: ${viewOrder['العنوان التفصيلي']}\nالشحن: ${viewOrder['مصاريف الشحن']}\nالإجمالي: ${viewOrder['الإجمالي الكلي']}\nملاحظات: ${viewOrder['ملاحظات'] || ''}\nالمنتجات:\n${viewOrder['المنتجات']}\n===`}
            </div>

            <div className={styles.modalActions}>
              <button 
                className={`${styles.copyBtn} ${copied ? styles.copiedBtn : ''}`} 
                onClick={() => {
                  const text = `الاسم: ${viewOrder['اسم العميل']}\nالموبايل: ${viewOrder['رقم الهاتف']}\nالمحافظة: ${viewOrder['المحافظة']}\nالعنوان: ${viewOrder['العنوان التفصيلي']}\nالشحن: ${viewOrder['مصاريف الشحن']}\nالإجمالي: ${viewOrder['الإجمالي الكلي']}\nملاحظات: ${viewOrder['ملاحظات'] || ''}\nالمنتجات:\n${viewOrder['المنتجات']}\n===`;
                  navigator.clipboard.writeText(text);
                  setCopied(true);
                  setTimeout(() => {
                    setCopied(false);
                    setViewOrder(null);
                  }, 2000);
                }}
              >
                {copied ? '✔️ تم النسخ' : '📋 نسخ الطلب'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

