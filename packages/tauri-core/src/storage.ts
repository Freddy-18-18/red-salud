import { Store } from '@tauri-apps/plugin-store';

export class TauriStorageService {
  private store: Store | null = null;
  private storePath: string;

  constructor(storePath = 'settings.json') {
    this.storePath = storePath;
  }

  private async getStore(): Promise<Store> {
    if (!this.store) {
      this.store = await Store.load(this.storePath);
    }
    return this.store;
  }

  async get<T>(key: string): Promise<T | null> {
    const store = await this.getStore();
    return (await store.get<T>(key)) ?? null;
  }

  async set<T>(key: string, value: T): Promise<void> {
    const store = await this.getStore();
    await store.set(key, value);
    await store.save();
  }

  async delete(key: string): Promise<void> {
    const store = await this.getStore();
    await store.delete(key);
    await store.save();
  }

  async clear(): Promise<void> {
    const store = await this.getStore();
    await store.clear();
    await store.save();
  }
}
