import { useState, useEffect } from 'react';
import { useDataProvider, useNotify } from 'react-admin';

/**
 * 管理后台数据统计接口
 */
interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalCoupons: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  activeUsers: number;
  lowStockProducts: number;
  expiredCoupons: number;
}

/**
 * 订单趋势数据接口
 */
interface OrderTrend {
  date: string;
  orders: number;
  revenue: number;
}

/**
 * 热门产品接口
 */
interface PopularProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
}

/**
 * 用户增长数据接口
 */
interface UserGrowth {
  date: string;
  newUsers: number;
  totalUsers: number;
}

/**
 * 管理后台数据Hook
 * 提供统计数据、图表数据等管理后台所需的各种数据
 */
export const useAdminData = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orderTrends, setOrderTrends] = useState<OrderTrend[]>([]);
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dataProvider = useDataProvider();
  const notify = useNotify();

  /**
   * 获取管理后台统计数据
   */
  const fetchStats = async () => {
    try {
      const response = await dataProvider.getOne('admin/stats', {
        id: 'dashboard',
      });
      setStats(response.data);
    } catch (err) {
      console.error('Failed to fetch admin stats:', err);
      setError('获取统计数据失败');
      notify('获取统计数据失败', { type: 'error' });
    }
  };

  /**
   * 获取订单趋势数据
   */
  const fetchOrderTrends = async (days: number = 30) => {
    try {
      const response = await dataProvider.getList('admin/order-trends', {
        pagination: { page: 1, perPage: days },
        sort: { field: 'date', order: 'ASC' },
        filter: { days },
      });
      setOrderTrends(response.data);
    } catch (err) {
      console.error('Failed to fetch order trends:', err);
      setError('获取订单趋势失败');
    }
  };

  /**
   * 获取热门产品数据
   */
  const fetchPopularProducts = async (limit: number = 10) => {
    try {
      const response = await dataProvider.getList('admin/popular-products', {
        pagination: { page: 1, perPage: limit },
        sort: { field: 'sales', order: 'DESC' },
        filter: {},
      });
      setPopularProducts(response.data);
    } catch (err) {
      console.error('Failed to fetch popular products:', err);
      setError('获取热门产品失败');
    }
  };

  /**
   * 获取用户增长数据
   */
  const fetchUserGrowth = async (days: number = 30) => {
    try {
      const response = await dataProvider.getList('admin/user-growth', {
        pagination: { page: 1, perPage: days },
        sort: { field: 'date', order: 'ASC' },
        filter: { days },
      });
      setUserGrowth(response.data);
    } catch (err) {
      console.error('Failed to fetch user growth:', err);
      setError('获取用户增长数据失败');
    }
  };

  /**
   * 刷新所有数据
   */
  const refreshData = async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchStats(),
        fetchOrderTrends(),
        fetchPopularProducts(),
        fetchUserGrowth(),
      ]);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 初始化数据加载
   */
  useEffect(() => {
    refreshData();
  }, []);

  return {
    // 数据
    stats,
    orderTrends,
    popularProducts,
    userGrowth,

    // 状态
    loading,
    error,

    // 方法
    refreshData,
    fetchStats,
    fetchOrderTrends,
    fetchPopularProducts,
    fetchUserGrowth,
  };
};

/**
 * 产品库存警告Hook
 * 监控低库存产品
 */
export const useStockAlerts = (threshold: number = 10) => {
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const dataProvider = useDataProvider();
  const notify = useNotify();

  const fetchLowStockProducts = async () => {
    try {
      setLoading(true);
      const response = await dataProvider.getList('products', {
        pagination: { page: 1, perPage: 100 },
        sort: { field: 'stock', order: 'ASC' },
        filter: { stock_lt: threshold },
      });
      setLowStockProducts(response.data);

      if (response.data.length > 0) {
        notify(`发现 ${response.data.length} 个低库存产品`, {
          type: 'warning',
        });
      }
    } catch (err) {
      console.error('Failed to fetch low stock products:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockProducts();

    // 每5分钟检查一次库存
    const interval = setInterval(fetchLowStockProducts, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [threshold]);

  return {
    lowStockProducts,
    loading,
    refresh: fetchLowStockProducts,
  };
};

/**
 * 优惠券状态监控Hook
 * 监控即将过期的优惠券
 */
export const useCouponAlerts = () => {
  const [expiringSoonCoupons, setExpiringSoonCoupons] = useState([]);
  const [expiredCoupons, setExpiredCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const dataProvider = useDataProvider();
  const notify = useNotify();

  const fetchCouponAlerts = async () => {
    try {
      setLoading(true);

      // 获取7天内即将过期的优惠券
      const soonResponse = await dataProvider.getList('coupons', {
        pagination: { page: 1, perPage: 50 },
        sort: { field: 'validTo', order: 'ASC' },
        filter: {
          validTo_gte: new Date().toISOString(),
          validTo_lte: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
          isActive: true,
        },
      });
      setExpiringSoonCoupons(soonResponse.data);

      // 获取已过期但仍激活的优惠券
      const expiredResponse = await dataProvider.getList('coupons', {
        pagination: { page: 1, perPage: 50 },
        sort: { field: 'validTo', order: 'DESC' },
        filter: {
          validTo_lt: new Date().toISOString(),
          isActive: true,
        },
      });
      setExpiredCoupons(expiredResponse.data);

      if (soonResponse.data.length > 0) {
        notify(`${soonResponse.data.length} 个优惠券即将过期`, {
          type: 'warning',
        });
      }

      if (expiredResponse.data.length > 0) {
        notify(
          `${expiredResponse.data.length} 个优惠券已过期但仍处于激活状态`,
          { type: 'error' }
        );
      }
    } catch (err) {
      console.error('Failed to fetch coupon alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouponAlerts();

    // 每小时检查一次优惠券状态
    const interval = setInterval(fetchCouponAlerts, 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    expiringSoonCoupons,
    expiredCoupons,
    loading,
    refresh: fetchCouponAlerts,
  };
};

/**
 * 实时通知Hook
 * 处理系统实时通知
 */
export const useRealtimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const notify = useNotify();

  useEffect(() => {
    // 这里可以集成WebSocket或Server-Sent Events
    // 用于接收实时通知

    // 模拟实时通知
    const mockNotifications = [
      { id: 1, type: 'order', message: '新订单 #12345', timestamp: new Date() },
      { id: 2, type: 'stock', message: '产品库存不足', timestamp: new Date() },
      { id: 3, type: 'user', message: '新用户注册', timestamp: new Date() },
    ];

    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (notificationId: number) => {
    setNotifications((prev) =>
      prev.filter((n: any) => n.id !== notificationId)
    );
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return {
    notifications,
    markAsRead,
    clearAll,
  };
};
