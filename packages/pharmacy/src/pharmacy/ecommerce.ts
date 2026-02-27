import { v4 as uuidv4 } from 'uuid';
import {
  OnlineOrder,
  OnlineOrderStatus,
} from '@red-salud/types';

export class ECommerceManager {
  private orders: OnlineOrder[] = [];

  constructor() {
    this.loadOrders();
  }

  async loadOrders(): Promise<void> {
    const stored = localStorage.getItem('online_orders');
    if (stored) {
      this.orders = JSON.parse(stored) as OnlineOrder[];
    }
  }

  async saveOrders(): Promise<void> {
    localStorage.setItem('online_orders', JSON.stringify(this.orders));
  }

  async createOrder(order: Omit<OnlineOrder, 'id' | 'order_number' | 'created_at' | 'updated_at'>): Promise<OnlineOrder> {
    const newOrder: OnlineOrder = {
      ...order,
      id: uuidv4(),
      order_number: `WEB-${Date.now()}`,
      created_at: new Date(),
    };

    this.orders.push(newOrder);
    await this.saveOrders();

    return newOrder;
  }

  updateOrderStatus(orderId: string, status: OnlineOrderStatus): OnlineOrder | null {
    const order = this.orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = status;

    if (status === OnlineOrderStatus.CONFIRMED) {
      order.confirmed_at = new Date();
    } else if (status === OnlineOrderStatus.DELIVERED) {
      order.delivered_at = new Date();
    }

    return order;
  }

  getOrders(status?: OnlineOrderStatus, customerId?: string): OnlineOrder[] {
    let orders = [...this.orders];

    if (status) {
      orders = orders.filter((o) => o.status === status);
    }

    if (customerId) {
      orders = orders.filter((o) => o.customer_id === customerId);
    }

    return orders.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
  }

  getOrder(orderId: string): OnlineOrder | undefined {
    return this.orders.find((o) => o.id === orderId);
  }
}
