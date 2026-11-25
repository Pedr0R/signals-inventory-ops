import { StoragePort } from '../core/ports/storage.port';

/**
 * Implementação em memória de `StoragePort` para testes unitários determinísticos.
 */
export class FakeStorageAdapter implements StoragePort {
  private readonly store = new Map<string, string>();
  public writeCount = 0;

  /**
   * Lê o valor salvo para a chave informada ou retorna `null`.
   *
   * @example
   * const raw = fakeStorage.readItem('signal_order_workspace_v1');
   */
  public readItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  /**
   * Grava um valor em memória contabilizando escritas para asserção de `effect()`.
   *
   * @example
   * fakeStorage.writeItem('k', 'v');
   */
  public writeItem(key: string, value: string): void {
    this.store.set(key, value);
    this.writeCount += 1;
  }

  /**
   * Remove uma chave do armazenamento em memória.
   *
   * @example
   * fakeStorage.removeItem('k');
   */
  public removeItem(key: string): void {
    this.store.delete(key);
  }
}
