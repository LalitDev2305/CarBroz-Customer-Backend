import { IScreenBuilder } from '../builder/ScreenBuilderContract.js';


export class ScreenRegistry {
  private static builders: Map<string, IScreenBuilder> = new Map();

  public static register(screenId: string, builder: IScreenBuilder): void {
    this.builders.set(screenId, builder);
  }

  public static get(screenId: string): IScreenBuilder | undefined {
    return this.builders.get(screenId);
  }

  public static has(screenId: string): boolean {
    return this.builders.has(screenId);
  }
}
