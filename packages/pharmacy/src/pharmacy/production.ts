import { v4 as uuidv4 } from 'uuid';
import {
  ProductionOrder,
} from '@red-salud/types';

export class ProductionManager {
  private orders: ProductionOrder[] = [];

  constructor() {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    const stored = localStorage.getItem('production_orders');
    if (stored) {
      this.orders = JSON.parse(stored) as ProductionOrder[];
    }
  }

  async saveOrders(): Promise<void> {
    localStorage.setItem('production_orders', JSON.stringify(this.orders));
  }

  async createOrder(order: Omit<ProductionOrder, 'id' | 'created_at' | 'updated_at'>): Promise<ProductionOrder> {
    const newOrder: ProductionOrder = {
      ...order,
      id: uuidv4(),
      created_at: new Date(),
      updated_at: new Date(),
    };

    this.orders.push(newOrder);
    await this.saveOrders();

    return newOrder;
  }

  startProduction(orderId: string): ProductionOrder | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = 'in_progress';
    order.started_at = new Date();
    order.updated_at = new Date();

    return order;
  }

  completeProduction(orderId: string): ProductionOrder | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = 'completed';
    order.completed_at = new Date();
    order.updated_at = new Date();

    return order;
  }

  getOrders(status?: ProductionOrder['status']): ProductionOrder[] {
    let orders = [...this.orders];

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    return orders.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  getOrder(orderId: string): ProductionOrder | undefined {
    return this.orders.find((o) => o.id === orderId);
  }
}
