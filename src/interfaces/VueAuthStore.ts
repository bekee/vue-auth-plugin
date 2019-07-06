import { AuthUser } from './VueAuthOptions';
import { IVueAuthOptions } from '../lib/auth';

interface IVueAuthStore {
  getUser(): AuthUser;

  setUser(user: AuthUser): void;

  getToken(): string;

  setToken(token: string): void;

  getRefreshToken(): string;

  setRefreshToken(refreshToken: string): void;

  getRoles(): string[];
}

export abstract class VueAuthStore implements IVueAuthStore {
  protected store: any;

  protected constructor(protected Vue: any, protected options: IVueAuthOptions) {
  }

  public abstract getUser(): AuthUser;

  public abstract setUser(user: AuthUser): void;

  public abstract getToken(): string;

  public abstract setToken(token: string): void;

  public abstract getRefreshToken(): string;

  public abstract setRefreshToken(refreshToken: string): void;

  public abstract getRoles(): string[];

  protected initVue() {
    const token = this.getToken();
    if (token) {
      this.options.Vue.$data.token = token;
    }
    const refreshToken = this.getRefreshToken();
    if (refreshToken) {
      this.options.Vue.$data.refreshToken = refreshToken;
    }
    const user = this.getUser();
    if (user) {
      this.options.Vue.$data.user = user;
    }
  }
}
