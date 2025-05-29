import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  PasswordInput,
  DateInput,
  required,
  email,
  Show,
  SimpleShowLayout,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  useRecordContext,
  ReferenceManyField,
  NumberField,
} from 'react-admin';

/**
 * 用户角色选项
 */
const userRoleChoices = [
  { id: 'CUSTOMER', name: '普通用户' },
  { id: 'ADMIN', name: '管理员' },
  { id: 'SUPER_ADMIN', name: '超级管理员' },
];

/**
 * 用户列表组件
 */
export const UserList = () => (
  <List
    filters={[
      <TextInput source="search" label="搜索用户名/邮箱" alwaysOn />,
      <SelectInput
        source="role"
        label="用户角色"
        choices={userRoleChoices}
      />,
      <BooleanInput source="isActive" label="是否激活" />,
      <DateInput source="startDate" label="注册开始日期" />,
      <DateInput source="endDate" label="注册结束日期" />,
    ]}
    actions={
      <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
      </TopToolbar>
    }
    sort={{ field: 'createdAt', order: 'DESC' }}
  >
    <Datagrid rowClick="show">
      <TextField source="id" label="用户ID" />
      <TextField source="username" label="用户名" />
      <EmailField source="email" label="邮箱" />
      <UserRoleField source="role" label="角色" />
      <BooleanField source="isActive" label="激活状态" />
      <DateField source="lastLoginAt" label="最后登录" />
      <DateField source="createdAt" label="注册时间" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

/**
 * 用户创建组件
 */
export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="username"
        label="用户名"
        validate={[required()]}
        helperText="用户名必须唯一"
      />
      <TextInput
        source="email"
        label="邮箱"
        validate={[required(), email()]}
        helperText="邮箱必须唯一"
      />
      <PasswordInput
        source="password"
        label="密码"
        validate={[required()]}
        helperText="密码长度至少8位，包含字母和数字"
      />
      <SelectInput
        source="role"
        label="用户角色"
        choices={userRoleChoices}
        defaultValue="CUSTOMER"
        validate={[required()]}
      />
      <BooleanInput source="isActive" label="立即激活" defaultValue={true} />
      <TextInput source="firstName" label="名" />
      <TextInput source="lastName" label="姓" />
      <TextInput source="phone" label="电话" />
      <TextInput source="address" label="地址" multiline rows={3} />
    </SimpleForm>
  </Create>
);

/**
 * 用户编辑组件
 */
export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="username" label="用户名" validate={[required()]} disabled />
      <TextInput source="email" label="邮箱" validate={[required(), email()]} disabled />

      <SelectInput
        source="role"
        label="用户角色"
        choices={userRoleChoices}
        validate={[required()]}
      />

      <BooleanInput source="isActive" label="激活状态" />

      <TextInput source="firstName" label="名" />
      <TextInput source="lastName" label="姓" />
      <TextInput source="phone" label="电话" />
      <TextInput source="address" label="地址" multiline rows={3} />

      <PasswordInput
        source="newPassword"
        label="新密码"
        helperText="留空表示不修改密码"
      />
    </SimpleForm>
  </Edit>
);

/**
 * 用户详情显示组件
 */
export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="用户ID" />
      <TextField source="username" label="用户名" />
      <EmailField source="email" label="邮箱" />
      <UserRoleField source="role" label="角色" />
      <BooleanField source="isActive" label="激活状态" />

      {/* 个人信息 */}
      <TextField source="firstName" label="名" />
      <TextField source="lastName" label="姓" />
      <TextField source="phone" label="电话" />
      <TextField source="address" label="地址" />

      {/* 统计信息 */}
      <NumberField source="orderCount" label="订单数量" />
      <NumberField
        source="totalSpent"
        label="总消费金额"
        options={{ style: 'currency', currency: 'CNY' }}
      />

      {/* 时间信息 */}
      <DateField source="lastLoginAt" label="最后登录时间" />
      <DateField source="createdAt" label="注册时间" />
      <DateField source="updatedAt" label="更新时间" />

      {/* 用户的订单列表 */}
      <ReferenceManyField reference="orders" target="userId" label="用户订单">
        <Datagrid>
          <TextField source="orderNumber" label="订单号" />
          <NumberField
            source="finalAmount"
            label="订单金额"
            options={{ style: 'currency', currency: 'CNY' }}
          />
          <TextField source="status" label="状态" />
          <DateField source="createdAt" label="下单时间" />
        </Datagrid>
      </ReferenceManyField>
    </SimpleShowLayout>
  </Show>
);

/**
 * 用户角色显示组件
 */
export const UserRoleField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const roleMap = {
    CUSTOMER: { text: '普通用户', color: 'blue' },
    ADMIN: { text: '管理员', color: 'orange' },
    SUPER_ADMIN: { text: '超级管理员', color: 'red' },
  };

  const role = roleMap[record.role as keyof typeof roleMap] || { text: '未知', color: 'gray' };

  return (
    <span style={{ color: role.color, fontWeight: 'bold' }}>
      {role.text}
    </span>
  );
};

/**
 * 用户状态显示组件
 */
export const UserStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const now = new Date();
  const lastLogin = record.lastLoginAt ? new Date(record.lastLoginAt) : null;
  const daysSinceLogin = lastLogin ? Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24)) : null;

  let status = '正常';
  let color = 'green';

  if (!record.isActive) {
    status = '已停用';
    color = 'red';
  } else if (daysSinceLogin && daysSinceLogin > 30) {
    status = '长期未登录';
    color = 'orange';
  } else if (daysSinceLogin && daysSinceLogin > 7) {
    status = '不活跃';
    color = 'gray';
  }

  return (
    <span style={{ color, fontWeight: 'bold' }}>
      {status}
    </span>
  );
};

/**
 * 用户统计信息组件
 */
export const UserStatsField = () => {
  const record = useRecordContext();
  if (!record) return null;

  return (
    <div style={{ display: 'flex', gap: '20px', padding: '10px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
      <div>
        <strong>订单数:</strong> {record.orderCount || 0}
      </div>
      <div>
        <strong>总消费:</strong> ¥{record.totalSpent || 0}
      </div>
      <div>
        <strong>平均订单:</strong> ¥{record.orderCount > 0 ? Math.round((record.totalSpent || 0) / record.orderCount) : 0}
      </div>
    </div>
  );
};

// 导出所有组件
export default {
  list: UserList,
  create: UserCreate,
  edit: UserEdit,
  show: UserShow,
};
