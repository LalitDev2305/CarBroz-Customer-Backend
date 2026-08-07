import { IScreenBuilder } from '../builder/ScreenBuilderContract.js';
export declare class ScreenRegistry {
    private static builders;
    static register(screenId: string, builder: IScreenBuilder): void;
    static get(screenId: string): IScreenBuilder | undefined;
    static has(screenId: string): boolean;
}
