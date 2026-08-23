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
                    <th>اسم العميل</th>
                    <th>رقم الموبايل</th>
                    <th>المحافظة</th>
                    <th>العنوان التفصيلي</th>
                    <th>المنتجات المطلوبة</th>
                    <th>الشحن</th>
                    <th>ملاحظات</th>
                    <th>إجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={idx}>
                      <td>{order['اسم العميل']}</td>
                      <td dir="ltr" style={{textAlign: 'right'}}>{order['رقم الهاتف']}</td>
                      <td>{order['المحافظة']}</td>
                      <td>{order['العنوان التفصيلي']}</td>
                      <td className={styles.itemsCol} style={{ whiteSpace: 'pre-line' }}>
                        {order['المنتجات']}
                      </td>
                      <td>{order['مصاريف الشحن']}</td>
                      <td>{order['ملاحظات']}</td>
                      <td>
                        <div className={styles.actionCell}>
                          <button onClick={() => setViewOrder(order)} className={styles.viewBtn}>
                            عرض ونسخ
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
              {`الاسم: ${viewOrder['اسم العميل']}\nالموبايل: ${viewOrder['رقم الهاتف']}\nالمحافظة: ${viewOrder['المحافظة']}\nالعنوان: ${viewOrder['العنوان التفصيلي']}\nالشحن: ${viewOrder['مصاريف الشحن']}\nملاحظات: ${viewOrder['ملاحظات'] || ''}\nالمنتجات:\n${viewOrder['المنتجات']}\n===`}
            </div>

            <div className={styles.modalActions}>
              <button 
                className={`${styles.copyBtn} ${copied ? styles.copiedBtn : ''}`} 
                onClick={() => {
                  const text = `الاسم: ${viewOrder['اسم العميل']}\nالموبايل: ${viewOrder['رقم الهاتف']}\nالمحافظة: ${viewOrder['المحافظة']}\nالعنوان: ${viewOrder['العنوان التفصيلي']}\nالشحن: ${viewOrder['مصاريف الشحن']}\nملاحظات: ${viewOrder['ملاحظات'] || ''}\nالمنتجات:\n${viewOrder['المنتجات']}\n===`;
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

