'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Layout,
  Typography,
  Card,
  Table,
  Tag,
  Button,
  Space,
  Input,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Modal,
  Descriptions,
  List,
} from 'antd';
import {
  ArrowLeftOutlined,
  EyeOutlined,
  SearchOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../hooks/useAuth';
import orderService from '../../services/orderService';
import { Order } from 'shared/types';

const { Header, Content } = Layout;
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    paymentStatus: '',
    dateRange: null as any,
  });
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const query: any = {
        page: pagination.current,
        limit: pagination.pageSize,
      };

      if (filters.status) query.status = filters.status;
      if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus;
      if (filters.dateRange) {
        query.startDate = filters.dateRange[0].format('YYYY-MM-DD');
        query.endDate = filters.dateRange[1].format('YYYY-MM-DD');
      }

      const result = await orderService.getUserOrders(query);
      setOrders(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
      }));
    } catch (error) {
      message.error('加载订单列表失败');
    } finally {
      setLoading(false);
    }
  }, [pagination.current, pagination.pageSize, filters.status, filters.paymentStatus, filters.dateRange]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadOrders();
  }, [isAuthenticated, router, loadOrders]);

  const handleTableChange = (paginationInfo: any) => {
    setPagination({
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
      total: pagination.total,
    });
  };

  const handleViewDetail = (order: Order) => {
    setSelectedOrder(order);
    setDetailModalVisible(true);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await orderService.cancelOrder(orderId);
      message.success('订单已取消');
      loadOrders();
    } catch (error) {
      message.error('取消订单失败');
    }
  };

  const getStatusTag = (status: string) => {
    const statusMap = {
      PENDING: { color: 'orange', text: '待处理' },
      CONFIRMED: { color: 'blue', text: '已确认' },
      SHIPPED: { color: 'cyan', text: '已发货' },
      DELIVERED: { color: 'green', text: '已送达' },
      CANCELLED: { color: 'red', text: '已取消' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const getPaymentStatusTag = (status: string) => {
    const statusMap = {
      PENDING: { color: 'orange', text: '待支付' },
      PAID: { color: 'green', text: '已支付' },
      FAILED: { color: 'red', text: '支付失败' },
      REFUNDED: { color: 'purple', text: '已退款' },
    };
    const statusInfo = statusMap[status as keyof typeof statusMap] || statusMap.PENDING;
    return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
  };

  const formatPrice = (price: number) => {
    return `¥${price.toFixed(2)}`;
  };

  const columns = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 200,
      render: (id: string) => (
        <Button type="link" onClick={() => handleViewDetail(orders.find(o => o.id === id)!)}>
          {id.slice(0, 8)}...
        </Button>
      ),
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: '支付状态',
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (status: string) => getPaymentStatusTag(status),
    },
    {
      title: '订单金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => formatPrice(amount),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '操作',
      key: 'actions',
      render: (record: Order) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            查看
          </Button>
          {record.status === 'PENDING' && (
            <Button
              type="link"
              danger
              onClick={() => handleCancelOrder(record.id)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <Layout>
      <Header style={{
        background: '#fff',
        padding: '0 50px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Space align="center" style={{ height: '100%' }}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => router.back()}
          >
            返回
          </Button>
          <Title level={3} style={{ margin: 0 }}>
            我的订单
          </Title>
        </Space>
      </Header>

      <Content style={{ padding: '50px', minHeight: 'calc(100vh - 64px)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Card>
            {/* 筛选条件 */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="订单状态"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.status || undefined}
                  onChange={(value) => setFilters(prev => ({ ...prev, status: value || '' }))}
                >
                  <Option value="PENDING">待处理</Option>
                  <Option value="CONFIRMED">已确认</Option>
                  <Option value="SHIPPED">已发货</Option>
                  <Option value="DELIVERED">已送达</Option>
                  <Option value="CANCELLED">已取消</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} md={6}>
                <Select
                  placeholder="支付状态"
                  style={{ width: '100%' }}
                  allowClear
                  value={filters.paymentStatus || undefined}
                  onChange={(value) => setFilters(prev => ({ ...prev, paymentStatus: value || '' }))}
                >
                  <Option value="PENDING">待支付</Option>
                  <Option value="PAID">已支付</Option>
                  <Option value="FAILED">支付失败</Option>
                  <Option value="REFUNDED">已退款</Option>
                </Select>
              </Col>
              <Col xs={24} sm={8} md={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['开始日期', '结束日期']}
                  value={filters.dateRange}
                  onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
                />
              </Col>
              <Col xs={24} sm={24} md={4}>
                <Button
                  type="primary"
                  icon={<ReloadOutlined />}
                  onClick={loadOrders}
                  style={{ width: '100%' }}
                >
                  刷新
                </Button>
              </Col>
            </Row>

            {/* 订单表格 */}
            <Table
              columns={columns}
              dataSource={orders}
              rowKey="id"
              loading={loading}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`,
              }}
              onChange={handleTableChange}
            />
          </Card>

          {/* 订单详情弹窗 */}
          <Modal
            title="订单详情"
            open={detailModalVisible}
            onCancel={() => setDetailModalVisible(false)}
            footer={null}
            width={800}
          >
            {selectedOrder && (
              <div>
                <Descriptions bordered column={2}>
                  <Descriptions.Item label="订单号">{selectedOrder.id}</Descriptions.Item>
                  <Descriptions.Item label="订单状态">
                    {getStatusTag(selectedOrder.status)}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付状态">
                    {getPaymentStatusTag(selectedOrder.paymentStatus)}
                  </Descriptions.Item>
                  <Descriptions.Item label="支付方式">
                    {selectedOrder.paymentMethod}
                  </Descriptions.Item>
                  <Descriptions.Item label="订单金额">
                    {formatPrice(selectedOrder.totalAmount)}
                  </Descriptions.Item>
                  <Descriptions.Item label="创建时间">
                    {new Date(selectedOrder.createdAt).toLocaleString()}
                  </Descriptions.Item>
                </Descriptions>

                <Title level={5} style={{ marginTop: 24 }}>商品清单</Title>
                <List
                  dataSource={(selectedOrder as any).orderItems || []}
                  renderItem={(item: any) => (
                    <List.Item>
                      <List.Item.Meta
                        title={item.product?.name || '商品名称'}
                        description={`数量: ${item.quantity} | 单价: ${formatPrice(item.price)}`}
                      />
                      <div>{formatPrice(item.price * item.quantity)}</div>
                    </List.Item>
                  )}
                />

                {selectedOrder.notes && (
                  <>
                    <Title level={5} style={{ marginTop: 24 }}>订单备注</Title>
                    <p>{selectedOrder.notes}</p>
                  </>
                )}
              </div>
            )}
          </Modal>
        </div>
      </Content>
    </Layout>
  );
}
