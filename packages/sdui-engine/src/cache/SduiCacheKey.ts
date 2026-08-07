export class SduiCacheKey {
  public static createKey(screenId: string, version: number = 1): string {
    return `sdui:${screenId}:v${version}`;
  }
}
