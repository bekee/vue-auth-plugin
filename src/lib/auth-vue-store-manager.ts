import { VueConstructor } from 'vue';
import { AuthUser, TokenStore, VueAuthStore } from '../interfaces';
import { StoreCookie, StoreLocalStorage, StoreSessionStorage, StoreVuex } from './store';
import { IVueAuthOptions } from './auth';

export type StoreType = StoreVuex | StoreCookie | StoreSessionStorage | StoreLocalStorage;

export default class AuthStoreManager extends VueAuthStore {
  private stores?: StoreType[];

  constructor(Vue: VueConstructor, options: IVueAuthOptions) {
    super(Vue, options);
    this.setStores();
    this.options.Vue.$watch('user', (value) => {
      this.setUser(value);
    });
    this.options.Vue.$watch('token', (value) => {
      this.setToken(value);
    });
    this.options.Vue.$watch('refreshToken', (value) => {
      this.setRefreshToken(value);
    });
  }

  public get allStores() {
    return [...(this.stores || [])];
  }

  public setStores() {
    this.stores = Object.assign([], this.options.tokenStore)
      .map((store: TokenStore) => {
        switch (store) {
          case 'cookie':
            const cookieStore = new StoreCookie(this.Vue, this.options);
            return cookieStore.enabled ? cookieStore : null;
          case 'sessionStorage':
            return new StoreSessionStorage(this.Vue, this.options);
          case 'vuex':
            return new StoreVuex(this.Vue, this.options);
          default:
            return new StoreLocalStorage(this.Vue, this.options);
        }
      })
      .filter((store) => !!store) as StoreType[];
  }

  public getRoles(): string[] {
    return this.allStores
      .map((store) => store.getRoles())
      .filter((roles) => roles && roles.length)[0];
  }

  public getToken(): string {
    const token = this.allStores
      .map((store) => store.getToken())
      .filter((token) => !!token)[0];
    return token || this.options.Vue.$data.token;
  }
  public getRefreshToken(): string {
    const refreshToken = this.allStores
      .map((store) => store.getRefreshToken())
      .filter((refreshToken) => !!refreshToken)[0];
    return refreshToken || this.options.Vue.$data.refreshToken;
  }

  public getUser(): AuthUser {
    const user = this.allStores
      .map((store) => store.getUser())
      .filter((user) => !!user)[0];
    return user || this.options.Vue.$data.user;
  }

  public setToken(token: string | null): void {
    this.allStores
      .forEach((store) => {
        store.setToken(token);
      });
    this.options.Vue.$data.token = token;
  }

  public setRefreshToken(refreshToken: string | null): void {
    this.allStores
      .forEach((store) => {
        store.setRefreshToken(refreshToken);
      });
    this.options.Vue.$data.refreshToken = refreshToken;
  }

  public setUser(user: AuthUser | null): void {
    this.allStores
      .forEach((store) => {
        store.setUser(user);
      });
    this.options.Vue.$data.user = user;
  }

  public resetAll(): void {
    this.setUser(null);
    this.setToken(null);
    this.setRefreshToken(null);
    this.options.Vue.$data.user = null;
    this.options.Vue.$data.token = null;
    this.options.Vue.$data.refreshToken = null;
  }

  public check(role?: string | string[]): boolean {
    if (role) {
      const roles = this.getRoles();
      if (!roles) {
        return false;
      }
      if (Array.isArray(role)) {
        return roles.some((authrole) => role.includes(authrole));
      } else {
        return roles.includes(role);
      }
    } else {
      return !!this.getToken();
    }
  }
}
