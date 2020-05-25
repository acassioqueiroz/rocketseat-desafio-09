import Customer from '@modules/customers/infra/typeorm/entities/Customer';
import OrdersProducts from '../infra/typeorm/entities/OrdersProducts';

interface IProduct {
  product_id: string;
  price: number;
  quantity: number;
}

export default interface ICreateOrderDTO {
  customer: Customer;
  order_products: OrdersProducts[];
}
