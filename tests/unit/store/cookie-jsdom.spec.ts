/**
 * @jest-environment jsdom
 */

// @ts-ignore
import Cookies from 'js-cookie';
import StoreCookie from '../../../src/lib/store/store-cookie';
import { Vue, VueConstructor } from 'vue/types/vue';
import { createLocalVue } from '@vue/test-utils';
import { IVueAuthOptions } from '../../../src/lib/auth';
import { AuthUser } from '../../../src/interfaces';

type VueCookie = (Vue | VueConstructor) & { cookie?: any };

let options: IVueAuthOptions;
let vue: VueCookie;
let storeCookie: StoreCookie;
const user: AuthUser = {
  username: 'demo',
  login: 'demouser',
  email: 'demo@demo',
  roles: ['ROLE_ADMIN', 'ROLE_USER'],
};
const token = 'asdf123456asdf';

describe('Cookie store', () => {
  beforeEach(() => {
    vue = createLocalVue();
    options = {
      tokenDefaultName: 'token_cookie',
      refreshTokenDefaultName: 'refresh_cookie',
      userDefaultName: 'user_cookie',
      refreshHeaderToken: 'RefreshTokenAuth',
      headerRefreshTokenReplace: '{refresh_token}',
      rolesVar: 'roles',
      Vue: vue as any,
    };
  });
  beforeEach(() => {
    Object.values(options).forEach(Cookies.remove);
  });
  describe('Using Vue.cookie', () => {
    beforeEach(() => {
      vue.cookie = {
        get(value: string) {
          return Cookies.get(value);
        },
        set(name: string, value: any) {
          Cookies.set(name, value);
        },
        delete(name: string) {
          Cookies.remove(name);
        },
      };
      storeCookie = new StoreCookie(vue, options);
    });
    it('Set User', () => {
      storeCookie.setUser(user);
      expect(Cookies.get(options.userDefaultName)).toEqual(JSON.stringify(user));
      expect(Cookies.get(options.tokenDefaultName)).toBeUndefined();
      expect(storeCookie.getUser()).toEqual(user);
      expect(options.rolesVar).toBeDefined();
      expect(storeCookie.getRoles()).toEqual(options.rolesVar && user[options.rolesVar]);
    });
    it('Set Token', () => {
      storeCookie.setToken(token);
      expect(Cookies.get(options.tokenDefaultName)).toEqual(JSON.stringify(token));
      expect(Cookies.get(options.userDefaultName)).toBeUndefined();
      expect(storeCookie.getToken()).toEqual(token);
    });
    it('Set Refresh Token', () => {
      storeCookie.setRefreshToken(token);
      expect(Cookies.get(options.refreshTokenDefaultName)).toEqual(JSON.stringify(token));
      expect(Cookies.get(options.userDefaultName)).toBeUndefined();
      expect(storeCookie.getRefreshToken()).toEqual(token);
    });
    it('Remove User', () => {
      storeCookie.setUser(user);
      storeCookie.setUser(null);
      expect(Cookies.get(options.userDefaultName)).toBeUndefined();
      expect(storeCookie.getUser()).toBeUndefined();
      expect(storeCookie.getRoles()).toBeUndefined();
    });
    it('Remove Token', () => {
      storeCookie.setToken(token);
      storeCookie.setToken(null);
      expect(Cookies.get(options.tokenDefaultName)).toBeUndefined();
      expect(storeCookie.getToken()).toBeUndefined();
    });

    it('Remove Refresh Token', () => {
      storeCookie.setRefreshToken(token);
      storeCookie.setRefreshToken(null);
      expect(Cookies.get(options.refreshTokenDefaultName)).toBeUndefined();
      expect(storeCookie.getRefreshToken()).toBeUndefined();
    });
  });
  describe('Using document.cookie', () => {
    beforeEach(() => {
      vue.cookie = undefined;
      storeCookie = new StoreCookie(vue, options);
    });
    it('Set User', () => {
      storeCookie.setUser(user);
      expect(Cookies.get(options.userDefaultName)).toEqual(JSON.stringify(user));
      expect(Cookies.get(options.tokenDefaultName)).toBeUndefined();
      expect(storeCookie.getUser()).toEqual(user);
      expect(options.rolesVar).toBeDefined();
      expect(storeCookie.getRoles()).toEqual(options.rolesVar && user[options.rolesVar]);
    });
    it('Set Token', () => {
      storeCookie.setToken(token);
      expect(Cookies.get(options.tokenDefaultName)).toEqual(token);
      expect(Cookies.get(options.userDefaultName)).toBeUndefined();
      expect(storeCookie.getToken()).toEqual(token);
    });
    it('Set Refresh Token', () => {
      storeCookie.setRefreshToken(token);
      expect(Cookies.get(options.refreshTokenDefaultName)).toEqual(token);
      expect(Cookies.get(options.userDefaultName)).toBeUndefined();
      expect(storeCookie.getRefreshToken()).toEqual(token);
    });
    it('Remove User', () => {
      storeCookie.setUser(user);
      storeCookie.setUser(null);
      expect(Cookies.get(options.userDefaultName)).toEqual('');
      expect(storeCookie.getUser()).toBeNull();
      expect(storeCookie.getRoles()).toBeNull();
    });
    it('Remove Token', () => {
      storeCookie.setToken(token);
      storeCookie.setToken(null);
      expect(Cookies.get(options.tokenDefaultName)).toEqual('');
      expect(storeCookie.getToken()).toBeNull();
    });
    it('Remove Refresh Token', () => {
      storeCookie.setRefreshToken(token);
      storeCookie.setRefreshToken(null);
      expect(Cookies.get(options.refreshTokenDefaultName)).toEqual('');
      expect(storeCookie.getRefreshToken()).toBeNull();
    });
  });
});
