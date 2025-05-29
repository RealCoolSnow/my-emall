import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  required,
  Show,
  SimpleShowLayout,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  useRecordContext,
} from 'react-admin';

/**
 * 产品列表组件
 * 显示所有产品的列表，支持搜索、筛选、排序
 */
export const ProductList = () => (
  <List
    filters={[
      <TextInput source="search" label="搜索" alwaysOn />,
      <SelectInput
        source="status"
        label="状态"
        choices={[
          { id: 'ACTIVE', name: '上架' },
          { id: 'INACTIVE', name: '下架' },
          { id: 'OUT_OF_STOCK', name: '缺货' },
        ]}
      />,
      <SelectInput
        source="categoryId"
        label="分类"
        choices={[
          { id: '1', name: '电子产品' },
          { id: '2', name: '服装' },
          { id: '3', name: '家居' },
          { id: '4', name: '图书' },
        ]}
      />,
    ]}
    actions={
      <TopToolbar>
        <FilterButton />
        <CreateButton />
        <ExportButton />
      </TopToolbar>
    }
  >
    <Datagrid rowClick="show">
      <TextField source="id" label="ID" />
      <TextField source="name" label="产品名称" />
      <TextField source="description" label="描述" />
      <NumberField
        source="price"
        label="价格"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField source="stock" label="库存" />
      <TextField source="status" label="状态" />
      <TextField source="categoryId" label="分类ID" />
      <DateField source="createdAt" label="创建时间" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

/**
 * 产品创建组件
 * 用于创建新产品
 */
export const ProductCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="产品名称" validate={[required()]} />
      <TextInput source="description" label="产品描述" multiline rows={4} />
      <NumberInput source="price" label="价格" validate={[required()]} />
      <NumberInput source="stock" label="库存" validate={[required()]} />
      <SelectInput
        source="status"
        label="状态"
        choices={[
          { id: 'ACTIVE', name: '上架' },
          { id: 'INACTIVE', name: '下架' },
          { id: 'OUT_OF_STOCK', name: '缺货' },
        ]}
        defaultValue="ACTIVE"
        validate={[required()]}
      />
      <SelectInput
        source="categoryId"
        label="分类"
        choices={[
          { id: '1', name: '电子产品' },
          { id: '2', name: '服装' },
          { id: '3', name: '家居' },
          { id: '4', name: '图书' },
        ]}
        validate={[required()]}
      />
      <TextInput source="imageUrl" label="图片URL" />
      <TextInput source="tags" label="标签" helperText="用逗号分隔多个标签" />
    </SimpleForm>
  </Create>
);

/**
 * 产品编辑组件
 * 用于编辑现有产品
 */
export const ProductEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="产品名称" validate={[required()]} />
      <TextInput source="description" label="产品描述" multiline rows={4} />
      <NumberInput source="price" label="价格" validate={[required()]} />
      <NumberInput source="stock" label="库存" validate={[required()]} />
      <SelectInput
        source="status"
        label="状态"
        choices={[
          { id: 'ACTIVE', name: '上架' },
          { id: 'INACTIVE', name: '下架' },
          { id: 'OUT_OF_STOCK', name: '缺货' },
        ]}
        validate={[required()]}
      />
      <SelectInput
        source="categoryId"
        label="分类"
        choices={[
          { id: '1', name: '电子产品' },
          { id: '2', name: '服装' },
          { id: '3', name: '家居' },
          { id: '4', name: '图书' },
        ]}
        validate={[required()]}
      />
      <TextInput source="imageUrl" label="图片URL" />
      <TextInput source="tags" label="标签" helperText="用逗号分隔多个标签" />
    </SimpleForm>
  </Edit>
);

/**
 * 产品详情显示组件
 * 显示产品的详细信息
 */
export const ProductShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="产品名称" />
      <TextField source="description" label="产品描述" />
      <NumberField
        source="price"
        label="价格"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField source="stock" label="库存" />
      <TextField source="status" label="状态" />
      <TextField source="categoryId" label="分类ID" />
      <TextField source="imageUrl" label="图片URL" />
      <TextField source="tags" label="标签" />
      <DateField source="createdAt" label="创建时间" />
      <DateField source="updatedAt" label="更新时间" />
    </SimpleShowLayout>
  </Show>
);

/**
 * 产品状态显示组件
 * 根据状态显示不同的颜色和文本
 */
export const ProductStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const statusMap = {
    ACTIVE: { text: '上架', color: 'green' },
    INACTIVE: { text: '下架', color: 'red' },
    OUT_OF_STOCK: { text: '缺货', color: 'orange' },
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
 * 产品库存警告组件
 * 当库存低于阈值时显示警告
 */
export const StockWarningField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const lowStockThreshold = 10;
  const isLowStock = record.stock < lowStockThreshold;

  return (
    <span style={{ color: isLowStock ? 'red' : 'inherit' }}>
      {record.stock}
      {isLowStock && ' ⚠️'}
    </span>
  );
};

// 导出所有组件
export default {
  list: ProductList,
  create: ProductCreate,
  edit: ProductEdit,
  show: ProductShow,
};
