export function getBackendUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.FASTAPI_BACKEND_URL;
  if (process.env.NODE_ENV === 'production') {
    if (!envUrl) {
      throw new Error('NEXT_PUBLIC_API_URL environment variable is required in production');
    }
    if (envUrl.startsWith('http://')) {
      throw new Error(
        `Insecure API configuration: NEXT_PUBLIC_API_URL must use HTTPS in production, received: ${envUrl}`
      );
    }
    return envUrl.replace(/\/+$/, '');
  }
  return (envUrl || 'http://127.0.0.1:8000').replace(/\/+$/, '');
}
