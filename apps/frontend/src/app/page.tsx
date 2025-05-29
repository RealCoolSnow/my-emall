'use client';

import { Button, Typography } from 'antd';

const { Title, Paragraph } = Typography;

export default function Home() {
  return (
    <main style={{ padding: '2rem', textAlign: 'center' }}>
      <Title level={1}>欢迎来到电商平台</Title>
      <Paragraph>
        这是一个基于 Next.js、Express 和 SQLite 的线上商品交易平台
      </Paragraph>
      <Button type="primary" size="large">
        开始购物
      </Button>
    </main>
  );
}
