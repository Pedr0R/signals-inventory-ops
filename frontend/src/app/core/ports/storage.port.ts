import { InjectionToken } from '@angular/core';

export interface StoragePort {
  readItem(key: string): string | null;
  writeItem(key: string, value: string): void;
  removeItem(key: string): void;
}

/**
 * Adaptador de persistência local que encapsula `window.localStorage`
 * com proteção para ambientes sem DOM ou com armazenamento restrito.
 */
export class BrowserStorageAdapter implements StoragePort {
  /**
   * Lê um item salvo pela chave informada.
   *
   * @example
   * const raw = adapter.readItem('signal_order_state');
   */
  public readItem(key: string): string | null {
    if (typeof globalThis.localStorage === 'undefined') {
      return null;
    }

    try {
      return globalThis.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  /**
   * Persiste um valor textual associado à chave informada.
   *
   * @example
   * adapter.writeItem('signal_order_state', JSON.stringify(payload));
   */
  public writeItem(key: string, value: string): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    try {
      globalThis.localStorage.setItem(key, value);
    } catch {
      // Ignora erro de cota cheia ou modo privado sem interromper o fluxo reativo.
    }
  }

  /**
   * Remove um item salvo pela chave informada.
   *
   * @example
   * adapter.removeItem('signal_order_state');
   */
  public removeItem(key: string): void {
    if (typeof globalThis.localStorage === 'undefined') {
      return;
    }

    try {
      globalThis.localStorage.removeItem(key);
    } catch {
      // Ignora indisponibilidade de storage em ambientes restritos.
    }
  }
}

export const STORAGE_PORT = new InjectionToken<StoragePort>('STORAGE_PORT', {
  providedIn: 'root',
  factory: (): StoragePort => new BrowserStorageAdapter(),
});
