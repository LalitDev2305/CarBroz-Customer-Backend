import { BaseTemplate } from '../templates/BaseTemplate.js';
import { BaseSection } from '../sections/BaseSection.js';
import { UI } from '../utils/UI.js';
import { BaseScreenBuilder } from './BaseScreenBuilder.js';
export class DashboardBuilder extends BaseScreenBuilder {
    screenId = 'home';
    async build(context) {
        const isLoggedIn = context?.isLoggedIn ?? false;
        const template = new BaseTemplate('dashboard_layout', 'dashboard_template')
            .setProperties({
            horizontalAlignment: 'center',
        });
        // ==========================================
        // 1. COLLAPSING HEADER SECTION
        // ==========================================
        const headerSection = new BaseSection('header_section', 'collapsing_header_section')
            .addComponent(this.buildTopAppBar(isLoggedIn))
            .addComponent(this.buildSearchBar())
            .addComponent(this.buildCollapsedTopAppBar(isLoggedIn));
        // ==========================================
        // 2. DASHBOARD CONTENT SECTION
        // ==========================================
        const dashboardSection = new BaseSection('dashboard_section')
            .addComponent(this.buildHeroBanner());
        // Generate the 5 identical service grids as requested (Mock Data)
        for (let i = 0; i < 5; i++) {
            dashboardSection.addComponent(this.buildServiceGrid(`grid_menu_component_${i}`));
        }
        // Add Bottom Navigation
        dashboardSection.addComponent(this.buildBottomNavigation());
        template.addSection(headerSection);
        template.addSection(dashboardSection);
        const theme = {
            theme: 'light',
            showBackButton: false,
            backgroundGradient: {
                colors: [
                    { color: '#B8E3EA', stop: 0.0 },
                    { color: '#C7EBF0', stop: 0.15 },
                    { color: '#D7F1F4', stop: 0.35 },
                    { color: '#E7F7F9', stop: 0.6 },
                    { color: '#F2FBFC', stop: 0.8 },
                    { color: '#FBFEFE', stop: 1.0 },
                ],
            },
        };
        return {
            screenId: 'home_dashboard_screen',
            templateId: 'dashboard_template',
            templateType: 'dashboard_template',
            template,
            theme,
        };
    }
    // --- COMPONENT BUILDER HELPERS ---
    buildTopAppBar(isLoggedIn) {
        const rightSlot = UI.component('top_app_bar_content_subcomponent_right', 'top_app_bar_content_subcomponent')
            .setProperties({ slot: 'right', horizontalAlignment: 'end', verticalAlignment: 'center' });
        if (isLoggedIn) {
            rightSlot.addChild(UI.image('profile_image', 'http://127.0.0.1:3000/images/profile.png')
                .setProperties({ shape: 'circle', width: 'size_m', height: 'size_m' }));
        }
        else {
            rightSlot.addChild(UI.button('login_btn', 'Login')
                .setProperties({
                style: 'primary',
                size: 'text_s',
                height: 'size_s',
                corner_radius: 'radius_m',
            })
                .setAction('onClick', {
                type: 'navigation',
                payload: { destination: 'auth/auth_login', api: 'auth/auth_login' }
            }));
        }
        return UI.component('top_app_bar_component')
            .setProperties({
            height: 'size_m',
            layoutDirection: 'horizontal',
            horizontalArrangement: 'space_between',
            verticalAlignment: 'center',
            paddingStart: 'spacing_m',
            paddingEnd: 'spacing_m'
        })
            .addSubComponent(UI.component('top_app_bar_content_subcomponent_left', 'top_app_bar_content_subcomponent')
            .setProperties({ slot: 'left', layoutDirection: 'horizontal', verticalAlignment: 'center' })
            .addChild(UI.icon('location_icon', 'location').setProperties({ color: '#0EA5A8' }))
            .addChild(UI.text('location_text', 'Home - 123 Main St')
            .setProperties({ weight: 'Bold', size: 'text_m', marginStart: 'spacing_xs', marginEnd: 'spacing_xs' }))
            .addChild(UI.icon('dropdown_icon', 'arrow_drop_down').setProperties({ color: '#111827' })))
            .addSubComponent(rightSlot);
    }
    buildSearchBar() {
        return UI.component('search_bar_component')
            .setProperties({ paddingStart: 'spacing_m', paddingEnd: 'spacing_m' })
            .addSubComponent(UI.component('search_bar_content_subcomponent')
            .addChild(UI.input('home_search_input', 'text')
            .setProperties({
            placeholder: 'Search services...',
            backgroundColor: '#F3F4F6',
            corner_radius: 'radius_m',
            height: 'size_m',
            border: '#E5E7EB'
        })));
    }
    buildCollapsedTopAppBar(isLoggedIn) {
        const rightSlot = UI.component('top_app_bar_content_subcomponent_right', 'top_app_bar_content_subcomponent')
            .setProperties({ slot: 'right', horizontalAlignment: 'end', verticalAlignment: 'center' });
        if (isLoggedIn) {
            rightSlot.addChild(UI.image('profile_image', 'http://127.0.0.1:3000/images/profile.png')
                .setProperties({ shape: 'circle', width: 'size_m', height: 'size_m' }));
        }
        else {
            rightSlot.addChild(UI.button('login_btn_collapsed', 'Login')
                .setProperties({
                style: 'primary',
                size: 'text_s',
                height: 'size_s',
                corner_radius: 'radius_m',
            })
                .setAction('onClick', {
                type: 'navigation',
                payload: { destination: 'auth/auth_login', api: 'auth/auth_login' }
            }));
        }
        return UI.component('collapsed_top_app_bar_component', 'top_app_bar_component')
            .setProperties({
            height: 'size_m',
            layoutDirection: 'horizontal',
            horizontalArrangement: 'space_between',
            verticalAlignment: 'center',
            paddingStart: 'spacing_m',
            paddingEnd: 'spacing_m'
        })
            .addSubComponent(UI.component('collapsed_search_subcomponent', 'search_bar_content_subcomponent')
            .setProperties({ slot: 'left', layoutDirection: 'horizontal', verticalAlignment: 'center', widthPercent: '0.85' })
            .addChild(UI.input('collapsed_home_search_input', 'text')
            .setProperties({
            placeholder: 'Search services...',
            backgroundColor: '#F3F4F6',
            corner_radius: 'radius_m',
            height: 'size_s',
            border: '#E5E7EB'
        })))
            .addSubComponent(rightSlot);
    }
    buildHeroBanner() {
        return UI.component('image_banner_component')
            .setProperties({ marginTop: 'spacing_l' })
            .addSubComponent(UI.component('image_banner_content_subcomponent')
            .setProperties({
            backgroundColor: '#111827',
            corner_radius: 'radius_l',
            padding: 'spacing_m',
            layoutDirection: 'horizontal',
            verticalAlignment: 'center'
        })
            .addChild(UI.text('hero_text_col', 'Flat 50% Off\\non First Premium Wash')
            .setProperties({ color: '#FFFFFF', size: 'text_l', weight: 'Bold', widthPercent: '0.6' }))
            .addChild(UI.image('hero_image', 'http://127.0.0.1:3000/images/car_stars.png')
            .setProperties({ width: 'size_xl', height: 'size_xl', content_scale: 'Fit' })));
    }
    buildServiceGrid(id) {
        return UI.component(id, 'grid_menu_component')
            .setProperties({ marginTop: 'spacing_l' })
            .addSubComponent(UI.component('grid_menu_content_subcomponent_title', 'grid_menu_content_subcomponent')
            .setProperties({ layoutDirection: 'horizontal' })
            .addChild(UI.text('service_title', 'Our Services').setProperties({ weight: 'Bold', size: 'text_l' })))
            .addSubComponent(UI.component('grid_menu_content_subcomponent_row1', 'grid_menu_content_subcomponent')
            .setProperties({ layoutDirection: 'horizontal', horizontalArrangement: 'space_between', marginTop: 'spacing_m' })
            .addChild(UI.button('service_1_btn', 'Full Wash').setProperties({ icon: 'check', style: 'secondary', widthPercent: '0.45' }))
            .addChild(UI.button('service_2_btn', 'Deep Clean').setProperties({ icon: 'check', style: 'secondary', widthPercent: '0.45' })))
            .addSubComponent(UI.component('grid_menu_content_subcomponent_row2', 'grid_menu_content_subcomponent')
            .setProperties({ layoutDirection: 'horizontal', horizontalArrangement: 'space_between', marginTop: 'spacing_m' })
            .addChild(UI.button('service_3_btn', 'Coating').setProperties({ icon: 'check', style: 'secondary', widthPercent: '0.45' }))
            .addChild(UI.button('service_4_btn', 'Interior').setProperties({ icon: 'check', style: 'secondary', widthPercent: '0.45' })));
    }
    buildBottomNavigation() {
        return UI.component('bottom_navigation_component')
            .addSubComponent(UI.component('bottom_navigation_content_subcomponent')
            .addChild(UI.component('home_bottom_nav', 'generic_bottom_navigation')
            .setProperties({ activeTab: 'home' })));
    }
}
//# sourceMappingURL=DashboardBuilder.js.map