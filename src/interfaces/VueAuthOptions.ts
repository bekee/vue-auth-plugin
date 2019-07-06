export type TokenStore = 'localStorage' | 'sessionStorage' | 'cookie' | 'vuex';
export type TokenType = 'Bearer' | 'Basic' | '';
export type Method = 'GET' | 'POST';
export type BasicRedirectData = { url: string; method: Method; };
export type OptionalRedirectData = { url?: string; method?: Method; };
export type BasicRedirectEnabledData = OptionalRedirectData & { enabled?: boolean; };
export type RedirectData = { redirect?: string; };
export type LoginRedirectData = RedirectData & BasicRedirectData & { headerToken: string; fetchUser?: boolean; };
export type LogoutRedirectData = RedirectData & OptionalRedirectData & { makeRequest?: boolean; };
export type FetchData = BasicRedirectEnabledData & { interval?: number; };
export type RefreshData = BasicRedirectEnabledData & { interval?: number;  };

export type AuthUser = { [key: string]: any };

export interface VueAuthOptions {
  authMeta?: string;
  rolesVar?: string;
  tokenDefaultName?: string;
  userDefaultName?: string;
  refreshTokenDefaultName?: string;
  tokenStore?: TokenStore[];
  headerTokenReplace?: string;
  headerRefreshTokenReplace?: string;
  tokenType?: TokenType;
  vuexStoreSpace?: string;
  fetchItem?: string;
  refreshHeaderToken: string;

  authRedirect?: string;

  loginData?: LoginRedirectData;
  logoutData?: LogoutRedirectData;
  fetchData?: FetchData;
  refreshData?: RefreshData;
}
