import getExpoConfig from '../../../app.config';

describe('getExpoConfig', () => {
  afterEach(() => {
    delete process.env.EXPO_PUBLIC_APP_NAME;
    delete process.env.EXPO_PUBLIC_APP_ENV;
    delete process.env.EXPO_PUBLIC_API_BASE_URL;
  });

  it('embeds runtime config defaults into Expo extra', () => {
    const config = getExpoConfig();

    expect(config.name).toBe('Template Repo Mobile Single');
    expect(config.extra).toEqual({
      appName: 'Template Repo Mobile Single',
      environment: 'development',
      apiBaseUrl: 'https://api.example.com',
    });
  });

  it('embeds environment overrides into Expo extra', () => {
    process.env.EXPO_PUBLIC_APP_NAME = 'Template Staging';
    process.env.EXPO_PUBLIC_APP_ENV = 'staging';
    process.env.EXPO_PUBLIC_API_BASE_URL = 'https://staging.api.example.com';

    const config = getExpoConfig();

    expect(config.name).toBe('Template Staging');
    expect(config.extra).toEqual({
      appName: 'Template Staging',
      environment: 'staging',
      apiBaseUrl: 'https://staging.api.example.com',
    });
  });
});