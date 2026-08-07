import { IScreen, BaseScreenBuilder, BuildContext } from '@carbroz/sdui-engine';
export declare class DashboardBuilder extends BaseScreenBuilder {
    readonly screenId = "home";
    build(context?: BuildContext): Promise<IScreen>;
    private buildHeader;
    private buildSearchBox;
    private buildHeroBanner;
    private buildServicesCard;
}
