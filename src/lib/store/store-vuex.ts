import { ActionContext, Store } from 'vuex';
import { AuthUser, VueAuthStore } from '../../interfaces';
import { IVueAuthOptions } from '../auth';

export type AuthVuexState = {
  token?: string;
  refreshToken?: string;
  user?: AuthUser;
};

export default class StoreVuex extends VueAuthStore {
  private readonly module?: string;

  constructor(Vue: any, options: IVueAuthOptions) {
    super(Vue, options);
    if (!this.Vue.store) {
      throw Error('[vue-auth-plugin] vuex is a required dependency if you want to use "vuex" as storage');
    }
    this.store = this.Vue.store as Store<any>;
    this.module = this.options.vuexStoreSpace;
    this.createVueAuthStore();
    this.initVue();
  }

  public getRoles(): string[] {
    return this.store.getters[`${this.module}/getRoles`];
  }

  public getToken(): string {
    return this.store.getters[`${this.module}/getToken`];
  }

  public getRefreshToken(): string {
    return this.store.getters[`${this.module}/getRefreshToken`];
  }

  public getUser(): AuthUser {
    return this.store.getters[`${this.module}/getUser`];
  }

  public setToken(token: string | null): void {
    this.store.dispatch(`${this.module}/setToken`, token);
  }

  public setRefreshToken(refreshToken: string | null): void {
    this.store.dispatch(`${this.module}/setRefreshToken`, refreshToken);
  }

  public setUser(user: AuthUser | null): void {
    this.store.dispatch(`${this.module}/setUser`, user);
  }

  private createVueAuthStore() {
    const { rolesVar } = this.options;
    const module = {
      namespaced: true,
      state: {
        token: this.options.Vue.$data.token,
        refreshToken: this.options.Vue.$data.refreshToken,
        user: this.options.Vue.$data.user,
      } as AuthVuexState,
      mutations: {
        SET_TOKEN(state: AuthVuexState, token: string) {
          state.token = token;
        },
        SET_REFRESH_TOKEN(state: AuthVuexState, refreshToken: string) {
          state.refreshToken = refreshToken;
        },
        SET_USER(state: AuthVuexState, user: AuthUser) {
          state.user = user;
        },
      },
      actions: {
        setToken(actionContext: ActionContext<AuthVuexState, any>, token: string) {
          actionContext.commit('SET_TOKEN', token);
        },
        setRefreshToken(actionContext: ActionContext<AuthVuexState, any>, refreshToken: string) {
          actionContext.commit('SET_REFRESH_TOKEN', refreshToken);
        },
        setUser(actionContext: ActionContext<AuthVuexState, any>, user: AuthUser) {
          actionContext.commit('SET_USER', user);
        },
      },
      getters: {
        getToken(state: AuthVuexState): string | undefined {
          return state.token;
        },
        getRefreshToken(state: AuthVuexState): string | undefined {
          return state.refreshToken;
        },
        getUser(state: AuthVuexState): AuthUser | undefined {
          return state.user;
        },
        getRoles(state: AuthVuexState): string[] {
          const user = state.user;
          return user && rolesVar && user[rolesVar];
        },
      },
    };

    this.store.registerModule(this.module, module);
  }
}
