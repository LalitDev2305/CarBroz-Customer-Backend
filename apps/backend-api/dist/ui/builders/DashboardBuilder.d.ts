import { IScreen } from '../models/ui.models.js';
import { BaseScreenBuilder } from './BaseScreenBuilder.js';
import { BuildContext } from './IScreenBuilder.js';
export declare class DashboardBuilder extends BaseScreenBuilder {
    readonly screenId = "home";
    build(context?: BuildContext): Promise<IScreen>;
    private buildTopAppBar;
    private buildSearchBar;
    private buildCollapsedTopAppBar;
    private buildHeroBanner;
    private buildServiceGrid;
    private buildBottomNavigation;
}
