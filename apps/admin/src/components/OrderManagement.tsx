import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  DeleteButton,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  DateInput,
  required,
  Show,
  SimpleShowLayout,
  TopToolbar,
  ExportButton,
  FilterButton,
  useRecordContext,
  ArrayField,
  SingleFieldList,
  ChipField,
  ReferenceField,
  ReferenceManyField,
} from 'react-admin';

/**
 * 订单状态选项
 */
const orderStatusChoices = [
  { id: 'PENDING', name: '待处理' },
  { id: 'CONFIRMED', name: '已确认' },
  { id: 'PROCESSING', name: '处理中' },
  { id: 'SHIPPED', name: '已发货' },
  { id: 'DELIVERED', name: '已送达' },
  { id: 'CANCELLED', name: '已取消' },
  { id: 'REFUNDED', name: '已退款' },
];

/**
 * 支付状态选项
 */
const paymentStatusChoices = [
  { id: 'PENDING', name: '待支付' },
  { id: 'PAID', name: '已支付' },
  { id: 'FAILED', name: '支付失败' },
  { id: 'REFUNDED', name: '已退款' },
];

/**
 * 订单列表组件
 */
export const OrderList = () => (
  <List
    filters={[
      <TextInput source="search" label="搜索订单号/用户" alwaysOn />,
      <SelectInput
        source="status"
        label="订单状态"
        choices={orderStatusChoices}
      />,
      <SelectInput
        source="paymentStatus"
        label="支付状态"
        choices={paymentStatusChoices}
      />,
      <DateInput source="startDate" label="开始日期" />,
      <DateInput source="endDate" label="结束日期" />,
    ]}
    actions={
      <TopToolbar>
        <FilterButton />
        <ExportButton />
      </TopToolbar>
    }
    sort={{ field: 'createdAt', order: 'DESC' }}
  >
    <Datagrid rowClick="show">
      <TextField source="id" label="订单ID" />
      <TextField source="orderNumber" label="订单号" />
      <ReferenceField source="userId" reference="users" label="用户">
        <TextField source="username" />
      </ReferenceField>
      <NumberField
        source="totalAmount"
        label="订单金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="discountAmount"
        label="折扣金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="finalAmount"
        label="实付金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <OrderStatusField source="status" label="订单状态" />
      <PaymentStatusField source="paymentStatus" label="支付状态" />
      <DateField source="createdAt" label="创建时间" />
      <EditButton />
    </Datagrid>
  </List>
);

/**
 * 订单编辑组件（主要用于更新状态）
 */
export const OrderEdit = () => (
  <Edit>
    <SimpleForm>
      <TextField source="id" label="订单ID" />
      <TextField source="orderNumber" label="订单号" />
      <ReferenceField source="userId" reference="users" label="用户">
        <TextField source="username" />
      </ReferenceField>

      <SelectInput
        source="status"
        label="订单状态"
        choices={orderStatusChoices}
        validate={[required()]}
      />

      <SelectInput
        source="paymentStatus"
        label="支付状态"
        choices={paymentStatusChoices}
        validate={[required()]}
      />

      <TextField source="shippingAddress" label="收货地址" multiline />
      <TextField source="notes" label="备注" multiline />
    </SimpleForm>
  </Edit>
);

/**
 * 订单详情显示组件
 */
export const OrderShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="订单ID" />
      <TextField source="orderNumber" label="订单号" />

      {/* 用户信息 */}
      <ReferenceField source="userId" reference="users" label="用户">
        <TextField source="username" />
      </ReferenceField>
      <TextField source="userEmail" label="用户邮箱" />

      {/* 金额信息 */}
      <NumberField
        source="totalAmount"
        label="商品总金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="discountAmount"
        label="折扣金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="shippingFee"
        label="运费"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="finalAmount"
        label="实付金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />

      {/* 状态信息 */}
      <OrderStatusField source="status" label="订单状态" />
      <PaymentStatusField source="paymentStatus" label="支付状态" />

      {/* 地址信息 */}
      <TextField source="shippingAddress" label="收货地址" />
      <TextField source="contactPhone" label="联系电话" />

      {/* 订单商品 */}
      <ArrayField source="items" label="订单商品">
        <Datagrid>
          <ReferenceField source="productId" reference="products" label="商品">
            <TextField source="name" />
          </ReferenceField>
          <NumberField source="quantity" label="数量" />
          <NumberField
            source="price"
            label="单价"
            options={{ style: 'currency', currency: 'CNY' }}
          />
          <NumberField
            source="subtotal"
            label="小计"
            options={{ style: 'currency', currency: 'CNY' }}
          />
        </Datagrid>
      </ArrayField>

      {/* 使用的优惠券 */}
      <ArrayField source="appliedCoupons" label="使用的优惠券">
        <SingleFieldList>
          <ChipField source="couponCode" />
        </SingleFieldList>
      </ArrayField>

      {/* 时间信息 */}
      <DateField source="createdAt" label="创建时间" />
      <DateField source="updatedAt" label="更新时间" />
      <DateField source="shippedAt" label="发货时间" />
      <DateField source="deliveredAt" label="送达时间" />

      {/* 备注 */}
      <TextField source="notes" label="备注" />
    </SimpleShowLayout>
  </Show>
);

/**
 * 订单状态显示组件
 */
export const OrderStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusMap = {
    PENDING: { text: '待处理', color: 'orange' },
    CONFIRMED: { text: '已确认', color: 'blue' },
    PROCESSING: { text: '处理中', color: 'purple' },
    SHIPPED: { text: '已发货', color: 'cyan' },
    DELIVERED: { text: '已送达', color: 'green' },
    CANCELLED: { text: '已取消', color: 'red' },
    REFUNDED: { text: '已退款', color: 'gray' },
  };

  const status = statusMap[record.status as keyof typeof statusMap] || {
    text: '未知',
    color: 'gray',
  };

  return (
    <span style={{ color: status.color, fontWeight: 'bold' }}>
      {status.text}
    </span>
  );
};

/**
 * 支付状态显示组件
 */
export const PaymentStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusMap = {
    PENDING: { text: '待支付', color: 'orange' },
    PAID: { text: '已支付', color: 'green' },
    FAILED: { text: '支付失败', color: 'red' },
    REFUNDED: { text: '已退款', color: 'gray' },
  };

  const status = statusMap[record.paymentStatus as keyof typeof statusMap] || {
    text: '未知',
    color: 'gray',
  };

  return (
    <span style={{ color: status.color, fontWeight: 'bold' }}>
      {status.text}
    </span>
  );
};

/**
 * 订单统计组件
 */
export const OrderStats = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <div
      style={{
        display: 'flex',
        gap: '20px',
        padding: '10px',
        backgroundColor: '#f5f5f5',
        borderRadius: '4px',
      }}
    >
      <div>
        <strong>商品数量:</strong> {record.items?.length || 0}
      </div>
      <div>
        <strong>总件数:</strong>{' '}
        {record.items?.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        ) || 0}
      </div>
      <div>
        <strong>折扣率:</strong>{' '}
        {record.totalAmount > 0
          ? Math.round((record.discountAmount / record.totalAmount) * 100)
          : 0}
        %
      </div>
    </div>
  );
};

// 导出所有组件
export default {
  list: OrderList,
  edit: OrderEdit,
  show: OrderShow,
};
