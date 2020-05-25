import { getRepository, Repository, In } from 'typeorm';

import IProductsRepository from '@modules/products/repositories/IProductsRepository';
import ICreateProductDTO from '@modules/products/dtos/ICreateProductDTO';
import IUpdateProductsQuantityDTO from '@modules/products/dtos/IUpdateProductsQuantityDTO';
import AppError from '@shared/errors/AppError';
import Product from '../entities/Product';

interface IFindProducts {
  id: string;
}

class ProductsRepository implements IProductsRepository {
  private ormRepository: Repository<Product>;

  constructor() {
    this.ormRepository = getRepository(Product);
  }

  public async create({
    name,
    price,
    quantity,
  }: ICreateProductDTO): Promise<Product> {
    const product = this.ormRepository.create({ name, price, quantity });
    await this.ormRepository.save(product);
    return product;
  }

  public async findByName(name: string): Promise<Product | undefined> {
    const product = this.ormRepository.findOne({
      where: { name },
    });
    return product;
  }

  public async findAllById(products: IFindProducts[]): Promise<Product[]> {
    const productsIdArray = products.map<string>(product => product.id);
    return this.ormRepository.find({
      where: {
        id: In(productsIdArray),
      },
    });
  }

  public async updateQuantity(
    products: IUpdateProductsQuantityDTO[],
  ): Promise<Product[]> {
    const productsUpdated: Product[] = [];
    await Promise.all(
      products.map(async product => {
        const productUpdate = await this.ormRepository.findOne(product.id);
        if (productUpdate) {
          productUpdate.quantity -= product.quantity;
          const productAfterUpdate = await this.ormRepository.save(
            productUpdate,
          );
          productsUpdated.push(productAfterUpdate);
        }
      }),
    );
    return productsUpdated;
  }
}

export default ProductsRepository;
