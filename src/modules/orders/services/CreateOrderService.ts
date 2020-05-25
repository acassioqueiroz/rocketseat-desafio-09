import { inject, injectable } from 'tsyringe';

import AppError from '@shared/errors/AppError';

import IProductsRepository, {
  IFindProducts,
} from '@modules/products/repositories/IProductsRepository';
import ICustomersRepository from '@modules/customers/repositories/ICustomersRepository';
import Order from '../infra/typeorm/entities/Order';
import IOrdersRepository from '../repositories/IOrdersRepository';
import OrdersProducts from '../infra/typeorm/entities/OrdersProducts';

interface IProduct {
  id: string;
  quantity: number;
}

interface IRequest {
  customer_id: string;
  products: IProduct[];
}

@injectable()
class CreateOrderService {
  constructor(
    @inject('OrdersRepository')
    private ordersRepository: IOrdersRepository,
    @inject('ProductsRepository')
    private productsRepository: IProductsRepository,
    @inject('CustomersRepository')
    private customersRepository: ICustomersRepository,
  ) {}

  public async execute({ customer_id, products }: IRequest): Promise<Order> {
    const customer = await this.customersRepository.findById(customer_id);
    if (!customer) {
      throw new AppError("This customer's id doesn't exist.");
    }
    const ordersProducts: OrdersProducts[] = [];
    const productsIdList = products.map<IFindProducts>(product => {
      return { id: product.id };
    });
    const findProducts = await this.productsRepository.findAllById(
      productsIdList,
    );

    products.forEach(product => {
      const findProduct = findProducts.find(
        productItem => productItem.id === product.id,
      );
      if (!findProduct) {
        throw new AppError(`The product with id ${product.id} doesn't exist.`);
      }
      if (findProduct.quantity < product.quantity) {
        throw new AppError(
          `The product with id ${product.id} is out of stock.`,
        );
      }
      const ordersProductsItem: OrdersProducts = {
        product_id: product.id,
        quantity: product.quantity,
        price: findProduct.price,
      };
      ordersProducts.push(ordersProductsItem);
    });

    const order = await this.ordersRepository.create({
      customer,
      order_products: ordersProducts,
    });

    await this.productsRepository.updateQuantity(products);
    return order;
  }
}

export default CreateOrderService;
