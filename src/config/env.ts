class ConfigService {
  private static instance: ConfigService;
  private readonly apiUrl: string;
  private readonly apiTimeout: number;

  private constructor() {
    this.apiUrl = this.get('VITE_API_BASE_URL', 'http://localhost:3000');
    this.apiTimeout = parseInt(this.get('VITE_API_TIMEOUT', '5000'), 10);
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private get(key: string, defaultValue = ''): string {
    const value = import.meta.env[key] as string | undefined;
    return value ?? defaultValue;
  }

  get API_BASE_URL(): string {
    return this.apiUrl;
  }

  get API_TIMEOUT(): number {
    return this.apiTimeout;
  }
}

export const config = ConfigService.getInstance();
