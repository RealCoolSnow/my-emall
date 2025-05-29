import { Admin, Resource } from 'react-admin';
import jsonServerProvider from 'ra-data-json-server';

const dataProvider = jsonServerProvider('http://localhost:3001/api');

function App() {
  return (
    <Admin dataProvider={dataProvider} title="电商平台管理后台">
      <Resource name="products" />
      <Resource name="orders" />
      <Resource name="users" />
      <Resource name="coupons" />
    </Admin>
  );
}

export default App;
