import plugin from '../../src/index';
import MockAdapter from 'axios-mock-adapter';
import { LocalVueType, prepareVue } from '../helper/prepare';

let localVue: LocalVueType;
const options = {
  tokenDefaultName: 'auth_token',
  refreshTokenDefaultName: 'refresh_token',
  userDefaultName: 'auth_user',
  tokenType: 'Bearer',
  rolesVar: 'roles',
  vuexStoreSpace: 'vue-auth',
  tokenStore: ['vuex', 'localStorage', 'sessionStorage', 'cookie'],
  headerTokenReplace: '{auth_token}',
  headerRefreshTokenReplace: '{refresh_token}',
  authRedirect: '/login',
  refreshHeaderToken: 'RefreshTokenAuth',
  loginData: {
    url: '/auth/login',
    method: 'POST',
    redirect: '/',
    headerToken: 'Authorization',
    fetchUser: false,
  },
  fetchData: {
    url: '/auth/user',
    method: 'GET',
    interval: 30,
    enabled: false,
  },
  logoutData: {
    url: '/auth/logout',
    method: 'POST',
    redirect: '/login',
    makeRequest: true,
  },
  refreshData: {
    url: '/auth/refresh',
    method: 'GET',
    interval: 30,
    enabled: true,
  },
};

describe('Plugin', () => {
  beforeAll(() => {
    localVue = prepareVue();
    localVue.use(plugin, options);
  });
  it('Error in login', async () => {
    localVue.router.push('/');
    expect((localVue.router as any).history.getCurrentLocation()).toEqual(options.authRedirect);
    const mock = new MockAdapter(localVue.axios);
    mock.onPost(`${localVue.axios.defaults.baseURL}${options.loginData.url}`)
      .reply(500, { response: 'error' });
    try {
      await localVue.$auth.login({ username: 'test', password: 'test' });
      fail('Login http petition must fail');
    } catch (e) {
      expect(e).toBeDefined();
    }
    localVue.router.push('/');
    expect((localVue.router as any).history.getCurrentLocation()).toEqual(options.authRedirect);
  });
  describe('Fetch user and Refresh token error', () => {
    const sampleToken = '123456abcdef123456789';
    beforeAll(async () => {
      const mock = new MockAdapter(localVue.axios);
      const loginHeaders = { [options.loginData.headerToken.toLowerCase()]: `${options.tokenType} ${sampleToken}` };
      mock.onPost(`${localVue.axios.defaults.baseURL}${options.loginData.url}`)
        .reply(200,
          { response: true },
          loginHeaders);
      await localVue.$auth.login({ username: 'test', password: 'test' });
    });
    it('Login ok with null user', () => {
      const mock = new MockAdapter(localVue.axios);
      mock.onGet(`${localVue.axios.defaults.baseURL}${options.fetchData.url}`)
        .reply(500, { response: 'error' });
      expect(localVue.$auth.token()).toEqual(sampleToken);
      expect(localVue.$auth.user()).toBeNull();
    });
    it('Error in refresh token', async () => {
      const previousToken = localVue.$auth.token();
      const mock = new MockAdapter(localVue.axios);
      mock.onGet(`${localVue.axios.defaults.baseURL}${options.refreshData.url}`)
        .reply(500, { response: 'error' });
      try {
        await localVue.$auth.refresh();
        fail('Refresh http petition must fail');
      } catch (e) {
        expect(e).toBeDefined();
      }
      expect(localVue.$auth.token()).toEqual(previousToken);
    });
    it('Error in fetch user', async () => {
      const mock = new MockAdapter(localVue.axios);
      mock.onGet(`${localVue.axios.defaults.baseURL}${options.fetchData.url}`)
        .reply(500, { response: 'error' });
      try {
        await localVue.$auth.fetchUser();
        fail('Fetch user http petition must fail');
      } catch (e) {
        expect(e).toBeDefined();
      }
      expect(localVue.$auth.token()).toEqual(sampleToken);
      expect(localVue.$auth.user()).toBeNull();
    });
    it('Error in fetch user and logout', async () => {
      localVue.router.push('/');
      expect((localVue.router as any).history.getCurrentLocation()).toEqual('/');
      const mock = new MockAdapter(localVue.axios);
      mock.onGet(`${localVue.axios.defaults.baseURL}${options.fetchData.url}`)
        .reply(401, { response: 'error' });
      try {
        await localVue.$auth.fetchUser();
        fail('Fetch user http petition must fail');
      } catch (e) {
        expect(e).toBeDefined();
      }
      expect(localVue.$auth.token()).toBeNull();
      expect(localVue.$auth.user()).toBeNull();
      localVue.router.push('/');
      expect((localVue.router as any).history.getCurrentLocation()).toEqual(options.authRedirect);
    });
    it('Fetch data with no token', async () => {
      const result = await localVue.$auth.fetchUser();
      expect(result).toBeNull();
    });
  });
});
describe('Plugin without login', () => {
  it('Configure plugin with loginData not set', async () => {
    localVue = prepareVue();
    const noLoginOptions = { ...options };
    delete noLoginOptions.loginData;
    localVue.use(plugin, noLoginOptions);
    try {
      await localVue.$auth.login({ username: 'test', password: 'test' });
      fail('Login with no loginData must fail');
    } catch (e) {
      expect(e).toBeDefined();
    }
  });
});
