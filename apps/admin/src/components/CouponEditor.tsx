// import { useState } from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  DateField,
  BooleanField,
  EditButton,
  DeleteButton,
  Create,
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  DateInput,
  BooleanInput,
  required,
  Show,
  SimpleShowLayout,
  TopToolbar,
  CreateButton,
  ExportButton,
  FilterButton,
  useRecordContext,
  FormDataConsumer,
} from 'react-admin';

/**
 * 优惠券类型选项
 */
const couponTypeChoices = [
  { id: 'PERCENTAGE', name: '百分比折扣' },
  { id: 'FIXED_AMOUNT', name: '固定金额折扣' },
  { id: 'FREE_SHIPPING', name: '免运费' },
  { id: 'BUY_X_GET_Y', name: '买X送Y' },
];

/**
 * 优惠券列表组件
 */
export const CouponList = () => (
  <List
    filters={[
      <TextInput source="search" label="搜索" alwaysOn />,
      <SelectInput source="type" label="类型" choices={couponTypeChoices} />,
      <BooleanInput source="isActive" label="是否激活" />,
      <DateInput source="validFrom" label="开始日期" />,
      <DateInput source="validTo" label="结束日期" />,
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
      <TextField source="code" label="优惠码" />
      <TextField source="name" label="名称" />
      <CouponTypeField />
      <NumberField source="value" label="折扣值" />
      <NumberField
        source="minAmount"
        label="最低消费"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="maxDiscount"
        label="最大折扣"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <BooleanField source="isActive" label="激活状态" />
      <DateField source="validFrom" label="开始日期" />
      <DateField source="validTo" label="结束日期" />
      <NumberField source="usageCount" label="使用次数" />
      <NumberField source="usageLimit" label="使用限制" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

/**
 * 优惠券创建组件
 */
export const CouponCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput
        source="code"
        label="优惠码"
        validate={[required()]}
        helperText="唯一的优惠码"
      />
      <TextInput source="name" label="优惠券名称" validate={[required()]} />
      <TextInput source="description" label="描述" multiline rows={3} />

      <SelectInput
        source="type"
        label="优惠券类型"
        choices={couponTypeChoices}
        validate={[required()]}
      />

      <FormDataConsumer>
        {({ formData }) => (
          <>
            {formData.type === 'PERCENTAGE' && (
              <NumberInput
                source="value"
                label="折扣百分比"
                validate={[required()]}
                helperText="输入1-100之间的数字，如20表示8折"
                min={1}
                max={100}
              />
            )}
            {formData.type === 'FIXED_AMOUNT' && (
              <NumberInput
                source="value"
                label="固定折扣金额"
                validate={[required()]}
                helperText="固定减免的金额"
                min={0}
              />
            )}
            {formData.type === 'BUY_X_GET_Y' && (
              <>
                <NumberInput
                  source="buyQuantity"
                  label="购买数量"
                  validate={[required()]}
                  min={1}
                />
                <NumberInput
                  source="getQuantity"
                  label="赠送数量"
                  validate={[required()]}
                  min={1}
                />
              </>
            )}
          </>
        )}
      </FormDataConsumer>

      <NumberInput source="minAmount" label="最低消费金额" min={0} />
      <NumberInput source="maxDiscount" label="最大折扣金额" min={0} />
      <NumberInput
        source="usageLimit"
        label="使用次数限制"
        min={1}
        helperText="留空表示无限制"
      />

      <DateInput source="validFrom" label="生效日期" validate={[required()]} />
      <DateInput source="validTo" label="失效日期" validate={[required()]} />

      <BooleanInput source="isActive" label="立即激活" defaultValue={true} />

      <TextInput
        source="applicableProducts"
        label="适用产品ID"
        helperText="用逗号分隔多个产品ID，留空表示适用所有产品"
      />
      <TextInput
        source="applicableCategories"
        label="适用分类ID"
        helperText="用逗号分隔多个分类ID"
      />
    </SimpleForm>
  </Create>
);

/**
 * 优惠券编辑组件
 */
export const CouponEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput
        source="code"
        label="优惠码"
        validate={[required()]}
        disabled
      />
      <TextInput source="name" label="优惠券名称" validate={[required()]} />
      <TextInput source="description" label="描述" multiline rows={3} />

      <SelectInput
        source="type"
        label="优惠券类型"
        choices={couponTypeChoices}
        validate={[required()]}
        disabled
      />

      <FormDataConsumer>
        {({ formData }) => (
          <>
            {formData.type === 'PERCENTAGE' && (
              <NumberInput
                source="value"
                label="折扣百分比"
                validate={[required()]}
                min={1}
                max={100}
              />
            )}
            {formData.type === 'FIXED_AMOUNT' && (
              <NumberInput
                source="value"
                label="固定折扣金额"
                validate={[required()]}
                min={0}
              />
            )}
            {formData.type === 'BUY_X_GET_Y' && (
              <>
                <NumberInput
                  source="buyQuantity"
                  label="购买数量"
                  validate={[required()]}
                  min={1}
                />
                <NumberInput
                  source="getQuantity"
                  label="赠送数量"
                  validate={[required()]}
                  min={1}
                />
              </>
            )}
          </>
        )}
      </FormDataConsumer>

      <NumberInput source="minAmount" label="最低消费金额" min={0} />
      <NumberInput source="maxDiscount" label="最大折扣金额" min={0} />
      <NumberInput source="usageLimit" label="使用次数限制" min={1} />

      <DateInput source="validFrom" label="生效日期" validate={[required()]} />
      <DateInput source="validTo" label="失效日期" validate={[required()]} />

      <BooleanInput source="isActive" label="激活状态" />

      <TextInput source="applicableProducts" label="适用产品ID" />
      <TextInput source="applicableCategories" label="适用分类ID" />
    </SimpleForm>
  </Edit>
);

/**
 * 优惠券详情显示组件
 */
export const CouponShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="code" label="优惠码" />
      <TextField source="name" label="名称" />
      <TextField source="description" label="描述" />
      <CouponTypeField />
      <NumberField source="value" label="折扣值" />
      <NumberField
        source="minAmount"
        label="最低消费"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField
        source="maxDiscount"
        label="最大折扣"
        options={{ style: 'currency', currency: 'CNY' }}
      />
      <NumberField source="usageCount" label="已使用次数" />
      <NumberField source="usageLimit" label="使用限制" />
      <BooleanField source="isActive" label="激活状态" />
      <DateField source="validFrom" label="生效日期" />
      <DateField source="validTo" label="失效日期" />
      <TextField source="applicableProducts" label="适用产品" />
      <TextField source="applicableCategories" label="适用分类" />
      <DateField source="createdAt" label="创建时间" />
      <DateField source="updatedAt" label="更新时间" />
    </SimpleShowLayout>
  </Show>
);

/**
 * 优惠券类型显示组件
 */
export const CouponTypeField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const typeMap = {
    PERCENTAGE: '百分比折扣',
    FIXED_AMOUNT: '固定金额折扣',
    FREE_SHIPPING: '免运费',
    BUY_X_GET_Y: '买X送Y',
  };

  return (
    <span>{typeMap[record.type as keyof typeof typeMap] || record.type}</span>
  );
};

/**
 * 优惠券状态显示组件
 */
export const CouponStatusField = () => {
  const record = useRecordContext();
  if (!record) return null;

  const now = new Date();
  const validFrom = new Date(record.validFrom);
  const validTo = new Date(record.validTo);

  let status = '未知';
  let color = 'gray';

  if (!record.isActive) {
    status = '已停用';
    color = 'red';
  } else if (now < validFrom) {
    status = '未开始';
    color = 'orange';
  } else if (now > validTo) {
    status = '已过期';
    color = 'red';
  } else {
    status = '有效';
    color = 'green';
  }

  return <span style={{ color, fontWeight: 'bold' }}>{status}</span>;
};

// 导出所有组件
export default {
  list: CouponList,
  create: CouponCreate,
  edit: CouponEdit,
  show: CouponShow,
};
