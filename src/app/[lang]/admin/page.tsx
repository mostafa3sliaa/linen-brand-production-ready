"use client";
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'settings'>('orders');

  // Orders State
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewOrder, setViewOrder] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [filterDate, setFilterDate] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Products State
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [productSuccessMsg, setProductSuccessMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New Product Helpers State
  const [manualImageUrl, setManualImageUrl] = useState('');
  const [customSizeInput, setCustomSizeInput] = useState('');

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    id: '',
    nameAr: '',
    nameEn: '',
    price: 650,
    shipping: 50,
    featuresAr: 'خامة كتان فاخرة\nمناسب لكل الأوقات\nألوان أنيقة وعصرية',
    images: [] as string[],
    colors: [
      { id: 'c-black', labelAr: 'أسود', hex: '#000000' }
    ],
    sizes: ['M', 'L', 'XL', '2XL', '3XL', '4XL'],
    hasSizeChart: true,
    videoUrl: '',
  });

  // Available size presets
  const sizePresets = ['S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL', '6XL'];

  // Settings State
  const [settings, setSettings] = useState({
    fbPixelId: '',
    tiktokPixelId: '',
    snapPixelId: ''
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1234') {
      setIsAuthenticated(true);
      fetchOrders();
      fetchProducts();
      fetchSettings();
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

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data?.products) {
        setProducts(data.products);
      }
    } catch (err) {
      console.error("Failed to fetch products", err);
    }
    setLoadingProducts(false);
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data?.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      console.error("Failed to fetch settings", err);
    }
  };

  const updateStatus = async (orderIds: string[], status: string) => {
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderIds, status })
      });
      if (res.ok) {
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

  // Helper to extract clean ID if user pasted full URL or snippet
  const extractPixelId = (input: string) => {
    if (!input) return '';
    const trimmed = input.trim();
    const match = trimmed.match(/\b\d{10,20}\b/);
    return match ? match[0] : trimmed;
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setSettingsSavedMsg('تم حفظ وتحديث البيكسل بنجاح! يعمل الآن على كامل المتجر ✓');
        setTimeout(() => setSettingsSavedMsg(''), 4000);
      } else {
        alert('حدث خطأ أثناء حفظ الإعدادات');
      }
    } catch (err) {
      console.error("Error saving settings", err);
      alert('حدث خطأ غير متوقع');
    }
    setSavingSettings(false);
  };

  // Client-side image compression
  const compressImage = (file: File): Promise<Blob> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > height && width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            resolve(blob || file);
          }, 'image/jpeg', 0.85);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle uploading multiple images from device
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newUrls: string[] = [];
      for (const file of Array.from(files)) {
        const compressedBlob = await compressImage(file);
        const formData = new FormData();
        formData.append('file', compressedBlob, file.name);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const data = await res.json();
        if (data?.url) {
          newUrls.push(data.url);
        }
      }

      if (newUrls.length > 0) {
        setNewProduct(prev => ({
          ...prev,
          images: [...prev.images, ...newUrls]
        }));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("حدث خطأ أثناء رفع الصور");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const addManualImage = () => {
    if (!manualImageUrl.trim()) return;
    setNewProduct(prev => ({
      ...prev,
      images: [...prev.images, manualImageUrl.trim()]
    }));
    setManualImageUrl('');
  };

  const removeImage = (index: number) => {
    setNewProduct(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Colors management
  const addColor = () => {
    setNewProduct(prev => ({
      ...prev,
      colors: [...prev.colors, { id: `c-${Date.now()}`, labelAr: 'لون جديد', hex: '#666666' }]
    }));
  };

  const updateColor = (index: number, key: 'labelAr' | 'hex', value: string) => {
    setNewProduct(prev => {
      const updated = [...prev.colors];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, colors: updated };
    });
  };

  const removeColor = (index: number) => {
    if (newProduct.colors.length <= 1) {
      alert("يجب أن يحتوي المنتج على لون واحد على الأقل");
      return;
    }
    setNewProduct(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }));
  };

  // Sizes management
  const toggleSize = (size: string) => {
    setNewProduct(prev => {
      const exists = prev.sizes.includes(size);
      const updated = exists ? prev.sizes.filter(s => s !== size) : [...prev.sizes, size];
      return { ...prev, sizes: updated };
    });
  };

  const addCustomSize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customSizeInput.trim()) return;
    const val = customSizeInput.trim().toUpperCase();
    if (!newProduct.sizes.includes(val)) {
      setNewProduct(prev => ({ ...prev, sizes: [...prev.sizes, val] }));
    }
    setCustomSizeInput('');
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.nameAr) {
      alert("يرجى كتابة اسم المنتج بالعربي");
      return;
    }

    if (newProduct.images.length === 0) {
      alert("يرجى إضافة صورة واحدة على الأقل للمنتج (عبر الرفع أو الرابط)");
      return;
    }

    const slug = newProduct.id.trim() || `prod-${Date.now().toString().slice(-6)}`;
    const featuresList = newProduct.featuresAr
      .split('\n')
      .map(f => f.trim())
      .filter(Boolean);

    const finalColors = newProduct.colors.map((c, i) => ({
      id: c.id || `color-${i}`,
      label: { ar: c.labelAr, en: c.labelAr },
      hex: c.hex,
      images: newProduct.images
    }));

    const productPayload = {
      id: slug,
      name: {
        ar: newProduct.nameAr,
        en: newProduct.nameEn || newProduct.nameAr,
      },
      price: Number(newProduct.price) || 650,
      shipping: Number(newProduct.shipping) || 50,
      videoUrl: newProduct.videoUrl.trim() || undefined,
      hasSizeChart: newProduct.hasSizeChart,
      features: {
        ar: featuresList.length > 0 ? featuresList : ['خامة عالية الجودة', 'تصميم عصري'],
        en: ['Premium Quality', 'Modern Design']
      },
      colors: finalColors,
      sizes: newProduct.sizes.length > 0 ? newProduct.sizes : ['M', 'L', 'XL', '2XL'],
      sizeChart: newProduct.hasSizeChart ? {
        "M": { shirtWidth: 52, shirtLength: 68, pantsLength: 98, weight: "من 50 كيلو إلى 60 كيلو" },
        "L": { shirtWidth: 54, shirtLength: 70, pantsLength: 99, weight: "من 60 كيلو إلى 70 كيلو" },
        "XL": { shirtWidth: 56, shirtLength: 70, pantsLength: 100, weight: "من 70 كيلو إلى 80 كيلو" },
        "2XL": { shirtWidth: 58, shirtLength: 72, pantsLength: 100, weight: "من 80 كيلو إلى 90 كيلو" },
        "3XL": { shirtWidth: 60, shirtLength: 72, pantsLength: 102, weight: "من 90 كيلو إلى 100 كيلو" },
        "4XL": { shirtWidth: 62, shirtLength: 75, pantsLength: 102, weight: "من 100 كيلو إلى 110 كيلو" },
      } : undefined
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: productPayload })
      });
      const data = await res.json();
      if (data.success || res.ok) {
        setIsAddProductOpen(false);
        setProductSuccessMsg(`تمت إضافة ونشر المنتج "${newProduct.nameAr}" بنجاح!`);
        setTimeout(() => setProductSuccessMsg(''), 5000);
        fetchProducts();
        // Reset form
        setNewProduct({
          id: '',
          nameAr: '',
          nameEn: '',
          price: 650,
          shipping: 50,
          featuresAr: 'خامة كتان فاخرة\nمناسب لكل الأوقات\nألوان أنيقة وعصرية',
          images: [],
          colors: [
            { id: 'c-black', labelAr: 'أسود', hex: '#000000' }
          ],
          sizes: ['M', 'L', 'XL', '2XL', '3XL', '4XL'],
          hasSizeChart: true,
          videoUrl: '',
        });
      } else {
        alert("فشل في إضافة المنتج: " + (data.error || "خطأ غير معروف"));
      }
    } catch (err) {
      console.error("Error creating product:", err);
      alert("حدث خطأ أثناء إضافة المنتج");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`هل أنت متأكد من رغبتك في حذف المنتج: "${name}"؟`)) {
      return;
    }
    try {
      const res = await fetch(`/api/products?id=${encodeURIComponent(id)}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (data.success || res.ok) {
        fetchProducts();
      } else {
        alert(data.error || "فشل حذف المنتج");
      }
    } catch (err) {
      console.error("Error deleting product:", err);
      alert("حدث خطأ أثناء الحذف");
    }
  };

  // Get unique dates for filter
  const uniqueDates = useMemo(() => {
    const dates = orders.map(o => {
      const dateTime = o['التاريخ والوقت'] || '';
      return dateTime.split(' ')[0]; // Extract just the DD/MM/YYYY part
    }).filter(d => d);
    return Array.from(new Set(dates));
  }, [orders]);

  // Filter orders by selected date and search query
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      // Date Match
      const dateTime = o['التاريخ والوقت'] || '';
      const dateMatch = filterDate === 'All' || dateTime.startsWith(filterDate);
      
      // Search Match
      const searchLower = searchQuery.toLowerCase();
      const nameMatch = (o['اسم العميل'] || '').toLowerCase().includes(searchLower);
      const phoneMatch = (o['رقم الهاتف'] || '').includes(searchLower);
      const searchMatch = !searchQuery || nameMatch || phoneMatch;

      return dateMatch && searchMatch;
    });
  }, [orders, filterDate, searchQuery]);

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
        
        {/* Navigation Tabs */}
        <div className={styles.tabsNav}>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'orders' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <span>📦</span> الطلبات الواردة ({filteredOrders.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'products' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('products')}
          >
            <span>🏷️</span> إدارة المنتجات ({products.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === 'settings' ? styles.tabBtnActive : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span>⚙️</span> إعدادات البيكسل والتتبع
          </button>
        </div>

        {/* Success Notifications */}
        {productSuccessMsg && (
          <div className={styles.successBanner}>
            <span>✓</span> {productSuccessMsg}
          </div>
        )}

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <>
            <div className={styles.header}>
              <div className={styles.headerLeft}>
                <h1 className={styles.title}>الطلبات الواردة</h1>
                
                <div className={styles.filterGroup}>
                  <input
                    type="text"
                    placeholder="بحث بالاسم أو رقم الموبايل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                  />
                  <select 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)}
                    className={styles.dateFilter}
                  >
                    <option value="All">كل التواريخ</option>
                    {uniqueDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>

                <button onClick={markAllProcessed} className={styles.secondaryBtn}>
                  تحديد الكل كـ مقروء ✓
                </button>
              </div>
              <a href={`/api/orders/export${filterDate !== 'All' ? `?date=${encodeURIComponent(filterDate)}` : ''}`} className={styles.exportBtn} download>
                <span>📥</span> تحميل ملف إكسيل
              </a>
            </div>

            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <span className={styles.statLabel}>إجمالي الطلبات</span>
                <span className={styles.statValue}>{filteredOrders.length}</span>
              </div>
              <div className={`${styles.statCard} ${styles.new}`}>
                <span className={styles.statLabel}>الطلبات الجديدة</span>
                <span className={styles.statValue}>{filteredOrders.filter(o => o['الحالة'] === 'New').length}</span>
              </div>
              <div className={`${styles.statCard} ${styles.processed}`}>
                <span className={styles.statLabel}>تم التسليم (مقروء)</span>
                <span className={styles.statValue}>{filteredOrders.filter(o => o['الحالة'] === 'Processed').length}</span>
              </div>
            </div>

            {loading ? (
              <div className={styles.loading}>جاري جلب الطلبات...</div>
            ) : filteredOrders.length === 0 ? (
              <div className={styles.emptyState}>لا توجد طلبات مطابقة للبحث أو التاريخ.</div>
            ) : (
              <div className={styles.tableResponsive}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>الحالة</th>
                      <th>التاريخ والوقت</th>
                      <th>العميل والهاتف</th>
                      <th>العنوان</th>
                      <th>المنتج والمقاس</th>
                      <th>الأسعار والشحن</th>
                      <th>الإجراء</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order, idx) => {
                      const isNew = order['الحالة'] === 'New';
                      return (
                        <tr key={idx} className={isNew ? styles.newRow : ''}>
                          <td>
                            <select
                              value={order['الحالة']}
                              onChange={(e) => updateStatus([order['رقم الطلب']], e.target.value)}
                              className={`${styles.statusSelect} ${styles[order['الحالة'].toLowerCase()]}`}
                            >
                              <option value="New">جديد</option>
                              <option value="Processed">تم</option>
                              <option value="Cancelled">ملغي</option>
                            </select>
                          </td>
                          <td className={styles.dateTimeCell}>
                            <div className={styles.dateText}>{(order['التاريخ والوقت'] || '').split(' ')[0]}</div>
                            <div className={styles.timeText}>{(order['التاريخ والوقت'] || '').split(' ')[1] || ''}</div>
                          </td>
                          <td>
                            <div className={styles.customerName}>{order['اسم العميل']}</div>
                            <div className={styles.customerPhone}>{order['رقم الهاتف']}</div>
                          </td>
                          <td className={styles.addressCell}>
                            <div className={styles.govTag}>{order['المحافظة']}</div>
                            <div className={styles.addressText}>{order['العنوان بالتفصيل']}</div>
                          </td>
                          <td className={styles.itemsCell}>
                            <pre className={styles.preItems}>{order['المنتجات']}</pre>
                          </td>
                          <td className={styles.priceCell}>
                            <div>منتجات: {order['سعر المنتجات'] ? `${order['سعر المنتجات']} ج` : '-'}</div>
                            <div>شحن: {order['الشحن'] ? `${order['الشحن']} ج` : '-'}</div>
                            <div className={styles.totalPrice}>الإجمالي: {order['الإجمالي الكلي'] ? `${order['الإجمالي الكلي']} ج` : '-'}</div>
                          </td>
                          <td>
                            <div className={styles.actionCell}>
                              <button 
                                className={styles.iconBtn}
                                title="عرض ونسخ تفاصيل الطلب"
                                onClick={() => {
                                  setViewOrder(order);
                                  setCopied(false);
                                }}
                              >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                  <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div className={styles.productsHeader}>
              <div>
                <h1 className={styles.title}>إدارة المنتجات</h1>
                <p style={{ color: '#6c757d', fontSize: '14px', marginTop: '4px' }}>
                  يمكنك إضافة أي منتج جديد وسيتم إنشاء صفحة متكاملة له ورابط مخصص للإعلانات تلقائياً!
                </p>
              </div>
              <button 
                onClick={() => setIsAddProductOpen(true)}
                className={styles.addProductBtn}
              >
                <span>+</span> إضافة منتج جديد
              </button>
            </div>

            {loadingProducts ? (
              <div className={styles.loading}>جاري جلب المنتجات...</div>
            ) : products.length === 0 ? (
              <div className={styles.emptyState}>لا توجد منتجات مسجلة حتى الآن.</div>
            ) : (
              <div className={styles.productGrid}>
                {products.map((p, idx) => {
                  const mainImg = p.colors?.[0]?.images?.[0] || '/images/black-suit.jpg';
                  return (
                    <div key={p.id || idx} className={styles.productCard}>
                      <div className={styles.productImageWrap}>
                        <img 
                          src={mainImg} 
                          alt={p.name?.ar || ''} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                      <div className={styles.productCardBody}>
                        <h3 className={styles.productCardTitle}>{p.name?.ar}</h3>
                        <div className={styles.productCardPrice}>{p.price} جنيه (+ {p.shipping || 50} شحن)</div>
                        
                        <div className={styles.productCardBadges}>
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d' }}>الألوان:</span>
                          {p.colors?.map((c: any, cIdx: number) => (
                            <span 
                              key={cIdx} 
                              className={styles.colorBadge} 
                              style={{ backgroundColor: c.hex }} 
                              title={c.label?.ar}
                            />
                          ))}
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#6c757d', marginRight: '8px' }}>المقاسات:</span>
                          <span className={styles.sizeBadge}>{p.sizes?.join(' - ') || 'M إلى 6XL'}</span>
                        </div>

                        <div className={styles.productCardActions}>
                          <Link 
                            href={`/ar/p/${p.id}`} 
                            target="_blank"
                            className={styles.viewProductLink}
                          >
                            👁️ فتح صفحة المنتج
                          </Link>
                          {products.length > 1 && (
                            <button 
                              onClick={() => handleDeleteProduct(p.id, p.name?.ar)}
                              className={styles.deleteProductBtn}
                              title="حذف المنتج"
                            >
                              🗑️ حذف
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS & PIXELS */}
        {activeTab === 'settings' && (
          <div className={styles.settingsCard}>
            <h2 className={styles.settingsTitle}>إعدادات بيكسل منصات الإعلانات</h2>
            <p className={styles.settingsSubtitle}>
              ضع معرّف البيكسل (Pixel ID) الخاص بالحساب الإعلاني، أو انسخ الرابط كاملاً وسيقوم النظام باستخراجه تلقائياً. بمجرد الحفظ، سيبدأ المتجر فوراً بتتبع الزوار وطلبات الشراء!
            </p>

            {settingsSavedMsg && (
              <div className={styles.successBanner}>
                {settingsSavedMsg}
              </div>
            )}

            <form onSubmit={handleSaveSettings}>
              {/* Facebook Pixel */}
              <div className={styles.settingField}>
                <label className={styles.settingLabel}>
                  <span>🔵</span> Facebook Pixel ID / Dataset ID
                </label>
                <input 
                  type="text" 
                  value={settings.fbPixelId}
                  onChange={(e) => {
                    const extracted = extractPixelId(e.target.value);
                    setSettings({ ...settings, fbPixelId: extracted });
                  }}
                  placeholder="مثال: 1726555298615011"
                  className={styles.settingInput}
                />
                <p className={styles.settingHelp}>
                  الرقم النشط حالياً: <strong>{settings.fbPixelId || 'لم يتم الضبط'}</strong>
                </p>
              </div>

              {/* TikTok Pixel */}
              <div className={styles.settingField}>
                <label className={styles.settingLabel}>
                  <span>⚫</span> TikTok Pixel ID
                </label>
                <input 
                  type="text" 
                  value={settings.tiktokPixelId}
                  onChange={(e) => setSettings({ ...settings, tiktokPixelId: e.target.value.trim() })}
                  placeholder="مثال: D9INTRJC77U820ARL2J0"
                  className={styles.settingInput}
                />
                <p className={styles.settingHelp}>
                  الرقم النشط حالياً: <strong>{settings.tiktokPixelId || 'لم يتم الضبط'}</strong>
                </p>
              </div>

              {/* Snapchat Pixel */}
              <div className={styles.settingField}>
                <label className={styles.settingLabel}>
                  <span>🟡</span> Snapchat Pixel ID (اختياري)
                </label>
                <input 
                  type="text" 
                  value={settings.snapPixelId}
                  onChange={(e) => setSettings({ ...settings, snapPixelId: e.target.value.trim() })}
                  placeholder="مثال: 12345678-abcd-..."
                  className={styles.settingInput}
                />
              </div>

              <button 
                type="submit" 
                disabled={savingSettings}
                className={styles.saveSettingsBtn}
              >
                {savingSettings ? 'جاري الحفظ والربط...' : 'حفظ الإعدادات وتفعيل البيكسل الآن ✓'}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* Modal: Add New Product */}
      {isAddProductOpen && (
        <div className={styles.formModalOverlay}>
          <div className={styles.formModalContent}>
            <div className={styles.formModalHeader}>
              <h2 style={{ fontSize: '18px', fontWeight: 800 }}>إضافة منتج جديد للمتجر</h2>
              <button 
                className={styles.closeModalBtn}
                onClick={() => setIsAddProductOpen(false)}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct}>
              <div className={styles.formGrid}>
                
                {/* 1. Basic Info */}
                <div className={styles.formGroup}>
                  <label>اسم المنتج بالعربي *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="مثال: طقم كتان كلاسيك"
                    value={newProduct.nameAr}
                    onChange={(e) => {
                      const name = e.target.value;
                      setNewProduct(prev => ({
                        ...prev,
                        nameAr: name,
                        id: prev.id ? prev.id : `prod-${Date.now().toString().slice(-6)}`
                      }));
                    }}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>معرف الرابط (Slug) *</label>
                  <input 
                    type="text" 
                    required
                    placeholder="مثال: classic-suit"
                    value={newProduct.id}
                    onChange={(e) => setNewProduct({ ...newProduct, id: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                  />
                  <p style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                    💡 هو الكلمة بالإنجليزية في رابط المنتج. يُكتب تلقائياً، ويمكنك تركه كما هو!
                  </p>
                </div>

                <div className={styles.formGroup}>
                  <label>السعر (جنيه) *</label>
                  <input 
                    type="number" 
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>سعر الشحن (جنيه) *</label>
                  <input 
                    type="number" 
                    required
                    value={newProduct.shipping}
                    onChange={(e) => setNewProduct({ ...newProduct, shipping: Number(e.target.value) })}
                  />
                </div>

                {/* 2. Multiple Images Upload */}
                <div className={styles.formGroupFull}>
                  <label style={{ fontSize: '14px', fontWeight: 800 }}>صور المنتج (يمكنك رفع أكثر من صورة) *</label>
                  
                  {/* File upload from device */}
                  <div 
                    className={styles.uploadDropzone}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      accept="image/*" 
                      multiple
                      style={{ display: 'none' }} 
                      onChange={handleImageUpload}
                    />
                    {uploading ? (
                      <div className={styles.uploadLoading}>⏳ جاري رفع وضغط الصور من جهازك، ثواني...</div>
                    ) : (
                      <>
                        <div style={{ fontSize: '28px' }}>📷</div>
                        <div style={{ fontWeight: 700, fontSize: '14px', color: '#115e34' }}>
                          اضغط هنا لرفع صور من جهازك (كمبيوتر أو موبايل)
                        </div>
                        <div style={{ fontSize: '12px', color: '#6c757d' }}>
                          يمكنك اختيار أكثر من صورة معاً (JPG, PNG, WebP)
                        </div>
                      </>
                    )}
                  </div>

                  {/* Uploaded Images Gallery */}
                  {newProduct.images.length > 0 && (
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#495057' }}>
                        الصور المرفوعة للمنتج ({newProduct.images.length}):
                      </span>
                      <div className={styles.imagesList}>
                        {newProduct.images.map((imgUrl, imgIdx) => (
                          <div key={imgIdx} className={styles.imageItemThumb}>
                            <img src={imgUrl} alt="صورة المنتج" />
                            <button 
                              type="button"
                              className={styles.removeImageBtn}
                              onClick={() => removeImage(imgIdx)}
                              title="حذف الصورة"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manual URL option */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <input 
                      type="text" 
                      placeholder="أو أضف رابط صورة مباشر واضغط إضافة..."
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className={styles.secondaryBtn} 
                      onClick={addManualImage}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      + إضافة
                    </button>
                  </div>
                </div>

                {/* 3. Colors List */}
                <div className={styles.formGroupFull}>
                  <label style={{ fontSize: '14px', fontWeight: 800 }}>ألوان المنتج</label>
                  <div className={styles.colorsContainer}>
                    {newProduct.colors.map((color, colorIdx) => (
                      <div key={color.id || colorIdx} className={styles.colorRow}>
                        <input 
                          type="color" 
                          value={color.hex}
                          onChange={(e) => updateColor(colorIdx, 'hex', e.target.value)}
                          style={{ width: '40px', height: '36px', padding: '0', cursor: 'pointer', border: 'none', background: 'transparent' }}
                        />
                        <input 
                          type="text" 
                          placeholder="اسم اللون (مثال: أسود، بيج، أبيض)"
                          value={color.labelAr}
                          onChange={(e) => updateColor(colorIdx, 'labelAr', e.target.value)}
                        />
                        {newProduct.colors.length > 1 && (
                          <button 
                            type="button" 
                            className={styles.removeColorBtn}
                            onClick={() => removeColor(colorIdx)}
                          >
                            حذف اللون
                          </button>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      className={styles.addColorBtn}
                      onClick={addColor}
                    >
                      + إضافة لون آخر للمنتج
                    </button>
                  </div>
                </div>

                {/* 4. Sizes Selection */}
                <div className={styles.formGroupFull}>
                  <label style={{ fontSize: '14px', fontWeight: 800 }}>المقاسات المتوفرة (اضغط لتحديد المقاس)</label>
                  <div className={styles.sizeChips}>
                    {sizePresets.map((s) => {
                      const isSelected = newProduct.sizes.includes(s);
                      return (
                        <button
                          key={s}
                          type="button"
                          className={`${styles.sizeChip} ${isSelected ? styles.sizeChipActive : ''}`}
                          onClick={() => toggleSize(s)}
                        >
                          {isSelected ? `✓ ${s}` : s}
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom size input */}
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="أو اكتب مقاس مخصص (مثال: Free Size أو 38)..."
                      value={customSizeInput}
                      onChange={(e) => setCustomSizeInput(e.target.value)}
                    />
                    <button 
                      type="button" 
                      className={styles.secondaryBtn}
                      onClick={addCustomSize}
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      + إضافة مقاس
                    </button>
                  </div>
                </div>

                {/* 5. Size Chart Toggle */}
                <div className={styles.formGroupFull}>
                  <label className={styles.toggleBox}>
                    <input 
                      type="checkbox" 
                      checked={newProduct.hasSizeChart}
                      onChange={(e) => setNewProduct({ ...newProduct, hasSizeChart: e.target.checked })}
                    />
                    <div>
                      <strong style={{ display: 'block', fontSize: '14px' }}>تفعيل جدول المقاسات والأوزان لهذا المنتج</strong>
                      <span style={{ fontSize: '12px', color: '#6c757d' }}>
                        {newProduct.hasSizeChart 
                          ? '✓ مفعّل: سيظهر زر جدول المقاسات وصندوق الوزن المناسب تلقائياً في صفحة المنتج.' 
                          : '✕ معطّل: لن يظهر زر جدول المقاسات (مناسب للمنتجات التي لا تحتاج جدول مقاسات كالساعات أو الإكسسوارات).'}
                      </span>
                    </div>
                  </label>
                </div>

                {/* 6. Video Support */}
                <div className={styles.formGroupFull}>
                  <label>🎥 رابط فيديو للمنتج (اختياري - YouTube أو Reel أو فيديو مباشر)</label>
                  <input 
                    type="text" 
                    placeholder="مثال: https://www.youtube.com/watch?v=... أو رابط فيديو مباشر"
                    value={newProduct.videoUrl}
                    onChange={(e) => setNewProduct({ ...newProduct, videoUrl: e.target.value })}
                  />
                  <p style={{ fontSize: '11px', color: '#6c757d', marginTop: '4px' }}>
                    إذا كان لديك فيديو للمنتج على يوتيوب أو تيك توك، ضع الرابط هنا وسيظهر للعملاء في صفحة المنتج!
                  </p>
                </div>

                {/* 7. Features */}
                <div className={styles.formGroupFull}>
                  <label>مميزات المنتج (سطر لكل ميزة)</label>
                  <textarea 
                    rows={3}
                    value={newProduct.featuresAr}
                    onChange={(e) => setNewProduct({ ...newProduct, featuresAr: e.target.value })}
                  />
                </div>

              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
                <button 
                  type="submit" 
                  className={styles.saveSettingsBtn}
                  style={{ background: '#115e34' }}
                >
                  حفظ ونشر صفحة المنتج الآن ✓
                </button>
                <button 
                  type="button" 
                  className={styles.secondaryBtn}
                  onClick={() => setIsAddProductOpen(false)}
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Order Modal */}
      {viewOrder && (
        <div className={styles.modalOverlay} onClick={() => setViewOrder(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>تفاصيل الطلب: {viewOrder['رقم الطلب']}</h3>
              <button className={styles.closeBtn} onClick={() => setViewOrder(null)}>✕</button>
            </div>
            
            <div className={styles.modalBody}>
              <div className={styles.orderSummaryText}>
                {`📦 تفاصيل الطلب (${viewOrder['رقم الطلب']}):
👤 العميل: ${viewOrder['اسم العميل']}
📞 الهاتف: ${viewOrder['رقم الهاتف']}
📍 المحافظة: ${viewOrder['المحافظة']}
🏠 العنوان: ${viewOrder['العنوان بالتفصيل']}
🏷️ المنتجات:
${viewOrder['المنتجات']}
💵 سعر المنتجات: ${viewOrder['سعر المنتجات']} جنيه
🚚 الشحن: ${viewOrder['الشحن']} جنيه
💰 الإجمالي الكلي: ${viewOrder['الإجمالي الكلي']} جنيه
📝 ملاحظات: ${viewOrder['ملاحظات'] || 'لا يوجد'}
⏰ التاريخ: ${viewOrder['التاريخ والوقت']}`}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button 
                className={`${styles.copyBtn} ${copied ? styles.copiedBtn : ''}`}
                onClick={() => {
                  const textToCopy = `📦 تفاصيل الطلب (${viewOrder['رقم الطلب']}):\n👤 العميل: ${viewOrder['اسم العميل']}\n📞 الهاتف: ${viewOrder['رقم الهاتف']}\n📍 المحافظة: ${viewOrder['المحافظة']}\n🏠 العنوان: ${viewOrder['العنوان بالتفصيل']}\n🏷️ المنتجات:\n${viewOrder['المنتجات']}\n💵 سعر المنتجات: ${viewOrder['سعر المنتجات']} جنيه\n🚚 الشحن: ${viewOrder['الشحن']} جنيه\n💰 الإجمالي الكلي: ${viewOrder['الإجمالي الكلي']} جنيه\n📝 ملاحظات: ${viewOrder['ملاحظات'] || 'لا يوجد'}\n⏰ التاريخ: ${viewOrder['التاريخ والوقت']}`;
                  navigator.clipboard.writeText(textToCopy);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? 'تم النسخ بنجاح! ✓' : '📋 نسخ تفاصيل الطلب بالكامل'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
