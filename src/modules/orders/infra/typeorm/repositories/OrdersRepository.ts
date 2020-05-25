import { getRepository, Repository } from 'typeorm';

import IOrdersRepository from '@modules/orders/repositories/IOrdersRepository';
import ICreateOrderDTO from '@modules/orders/dtos/ICreateOrderDTO';
import Order from '../entities/Order';

class OrdersRepository implements IOrdersRepository {
  private ormRepository: Repository<Order>;

  constructor() {
    this.ormRepository = getRepository(Order);
  }

  public async create({
    customer,
    order_products,
  }: ICreateOrderDTO): Promise<Order> {
    const orderCreated = this.ormRepository.create({
      customer,
      order_products,
    });
    await this.ormRepository.save(orderCreated);
    return orderCreated;
  }

  public async findById(id: string): Promise<Order | undefined> {
    return this.ormRepository.findOne({
      where: { id },
      relations: ['customer', 'order_products'],
    });
  }
}

export default OrdersRepository;
