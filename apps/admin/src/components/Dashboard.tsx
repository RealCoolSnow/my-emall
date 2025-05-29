import React from 'react';
import { Title } from 'react-admin';
import {
  useAdminData,
  useStockAlerts,
  useCouponAlerts,
} from '../hooks/useAdminData';

/**
 * 统计卡片组件
 */
interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;
  color?: string;
  icon?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  color = '#1976d2',
  icon,
}) => (
  <div
    style={{
      minHeight: '120px',
      margin: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}
  >
    <div
      style={{
        backgroundColor: color,
        color: 'white',
        padding: '16px',
        fontWeight: 'bold',
      }}
    >
      {title}
    </div>
    <div style={{ padding: '16px', textAlign: 'center' }}>
      <div style={{ fontSize: '2rem', fontWeight: 'bold', color }}>
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        {value}
      </div>
      {subtitle && (
        <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '4px' }}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);

/**
 * 警告列表组件
 */
interface AlertListProps {
  title: string;
  items: any[];
  renderItem: (item: any) => React.ReactNode;
  emptyMessage: string;
}

const AlertList: React.FC<AlertListProps> = ({
  title,
  items,
  renderItem,
  emptyMessage,
}) => (
  <div
    style={{
      margin: '8px',
      border: '1px solid #ddd',
      borderRadius: '4px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    }}
  >
    <div
      style={{
        backgroundColor: '#f5f5f5',
        padding: '16px',
        fontWeight: 'bold',
        borderBottom: '1px solid #ddd',
      }}
    >
      {title}
    </div>
    <div style={{ padding: '16px' }}>
      {items.length > 0 ? (
        <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                padding: '8px',
                borderBottom:
                  index < items.length - 1 ? '1px solid #eee' : 'none',
              }}
            >
              {renderItem(item)}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: '#666', padding: '20px' }}>
          {emptyMessage}
        </div>
      )}
    </div>
  </div>
);

/**
 * 管理后台仪表板组件
 */
export const Dashboard: React.FC = () => {
  const { stats, loading, error } = useAdminData();
  const { lowStockProducts } = useStockAlerts();
  const { expiringSoonCoupons, expiredCoupons } = useCouponAlerts();

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div>加载中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        <div>加载失败: {error}</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title title="管理后台仪表板" />

      {/* 统计概览 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          title="总用户数"
          value={stats?.totalUsers || 0}
          subtitle={`今日活跃: ${stats?.activeUsers || 0}`}
          color="#4caf50"
          icon="👥"
        />
        <StatCard
          title="总产品数"
          value={stats?.totalProducts || 0}
          subtitle={`低库存: ${lowStockProducts.length}`}
          color="#2196f3"
          icon="📦"
        />
        <StatCard
          title="总订单数"
          value={stats?.totalOrders || 0}
          subtitle={`今日: ${stats?.todayOrders || 0}`}
          color="#ff9800"
          icon="📋"
        />
        <StatCard
          title="总收入"
          value={`¥${stats?.totalRevenue?.toLocaleString() || 0}`}
          subtitle={`今日: ¥${stats?.todayRevenue?.toLocaleString() || 0}`}
          color="#9c27b0"
          icon="💰"
        />
        <StatCard
          title="优惠券数"
          value={stats?.totalCoupons || 0}
          subtitle={`即将过期: ${expiringSoonCoupons.length}`}
          color="#607d8b"
          icon="🎫"
        />
      </div>

      {/* 警告和通知区域 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* 低库存产品警告 */}
        <AlertList
          title={`低库存产品 (${lowStockProducts.length})`}
          items={lowStockProducts}
          renderItem={(product) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{product.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  ID: {product.id}
                </div>
              </div>
              <div
                style={{
                  color: product.stock === 0 ? 'red' : 'orange',
                  fontWeight: 'bold',
                }}
              >
                库存: {product.stock}
              </div>
            </div>
          )}
          emptyMessage="所有产品库存充足 ✅"
        />

        {/* 即将过期的优惠券 */}
        <AlertList
          title={`即将过期的优惠券 (${expiringSoonCoupons.length})`}
          items={expiringSoonCoupons}
          renderItem={(coupon) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold' }}>{coupon.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  代码: {coupon.code}
                </div>
              </div>
              <div style={{ color: 'orange', fontSize: '0.875rem' }}>
                {new Date(coupon.validTo).toLocaleDateString()}
              </div>
            </div>
          )}
          emptyMessage="没有即将过期的优惠券 ✅"
        />
      </div>

      {/* 已过期但仍激活的优惠券 */}
      {expiredCoupons.length > 0 && (
        <AlertList
          title={`已过期的激活优惠券 (${expiredCoupons.length}) ⚠️`}
          items={expiredCoupons}
          renderItem={(coupon) => (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', color: 'red' }}>
                  {coupon.name}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#666' }}>
                  代码: {coupon.code}
                </div>
              </div>
              <div style={{ color: 'red', fontSize: '0.875rem' }}>
                已过期: {new Date(coupon.validTo).toLocaleDateString()}
              </div>
            </div>
          )}
          emptyMessage=""
        />
      )}

      {/* 快速操作区域 */}
      <div
        style={{
          margin: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            fontWeight: 'bold',
            borderBottom: '1px solid #ddd',
          }}
        >
          快速操作
        </div>
        <div style={{ padding: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#4caf50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => (window.location.href = '#/products/create')}
            >
              ➕ 添加新产品
            </button>
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#2196f3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => (window.location.href = '#/coupons/create')}
            >
              🎫 创建优惠券
            </button>
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#ff9800',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => (window.location.href = '#/orders')}
            >
              📋 查看订单
            </button>
            <button
              style={{
                padding: '12px 24px',
                backgroundColor: '#9c27b0',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
              }}
              onClick={() => (window.location.href = '#/users')}
            >
              👥 管理用户
            </button>
          </div>
        </div>
      </div>

      {/* 系统信息 */}
      <div
        style={{
          margin: '8px',
          border: '1px solid #ddd',
          borderRadius: '4px',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        }}
      >
        <div
          style={{
            backgroundColor: '#f5f5f5',
            padding: '16px',
            fontWeight: 'bold',
            borderBottom: '1px solid #ddd',
          }}
        >
          系统信息
        </div>
        <div style={{ padding: '16px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              fontSize: '14px',
            }}
          >
            <div>
              <strong>系统版本:</strong> v1.0.0
            </div>
            <div>
              <strong>最后更新:</strong> {new Date().toLocaleDateString()}
            </div>
            <div>
              <strong>在线用户:</strong> {stats?.activeUsers || 0}
            </div>
            <div>
              <strong>系统状态:</strong>{' '}
              <span style={{ color: 'green' }}>正常运行</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
