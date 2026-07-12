import { BaseTemplate } from '../templates/BaseTemplate.js';
import { BaseSection } from '../sections/BaseSection.js';
import { UI } from '../utils/UI.js';
import { BaseScreenBuilder } from './BaseScreenBuilder.js';
export class AuthLoginBuilder extends BaseScreenBuilder {
    screenId = 'auth_login';
    async build(context) {
        const template = new BaseTemplate('login_layout', 'form_template')
            .setProperties({
            padding: 'spacing_m',
            verticalArrangement: 'center',
            horizontalAlignment: 'center',
        });
        const authSection = new BaseSection('authentication_section');
        // 1. Image Banner
        const imageBanner = UI.component('image_banner_component')
            .setProperties({ horizontalAlignment: 'center' })
            .addSubComponent(UI.component('image_banner_content_subcomponent')
            .setProperties({ horizontalAlignment: 'center' })
            .addChild(UI.image('logo_image', 'http://127.0.0.1:3000/images/carbroz_logo.png')
            .setProperties({
            width: 'size_huge',
            height: 'size_xxl',
            content_scale: 'Fit',
            marginTop: 'spacing_m',
        })));
        // 2. Page Header
        const pageHeader = UI.component('page_header_component')
            .setProperties({ horizontalAlignment: 'center' })
            .addSubComponent(UI.component('page_header_content_subcomponent')
            .setProperties({ horizontalAlignment: 'center' })
            .addChild(UI.text('login_subheading', 'Your Car, Our Care\\n At Your Doorstep')
            .setProperties({
            horizontalAlignment: 'center',
            font_family: 'Plus Jakarta Sans',
            weight: 'ExtraBold',
            size: 'text_huge',
            color: '#111827',
            marginTop: 'spacing_xxl',
            lineHeight: 'line_height_xl',
            letterSpacing: 'letter_spacing_xs',
            alignment: 'Center',
        }))
            .addChild(UI.text('login_body', 'Login or Sign up to explore premium\\ncar wash services')
            .setProperties({
            horizontalAlignment: 'center',
            font_family: 'Plus Jakarta Sans',
            weight: 'Medium',
            size: 'text_m',
            color: '#6B7280',
            marginTop: 'spacing_s',
            lineHeight: 'line_height_m',
            alignment: 'Center',
        })));
        // 3. Text Input (Phone)
        const textInputComp = UI.component('text_input_component')
            .addSubComponent(UI.component('text_input_content_subcomponent')
            .addChild(UI.input('phone_number_input', 'phone')
            .setProperties({
            placeholder: '+91 00000 00000',
            corner_radius: 'radius_m',
            border: '#D7EEF0',
            focus_border: '#0EA5A8',
            font_family: 'Plus Jakarta Sans',
            size: 'text_l',
            color: '#111827',
            backgroundColor: '#FFFFFF',
            padding: 'spacing_l',
            marginTop: 'spacing_xl',
            width: 'fill_max_width',
        })));
        // 4. Primary Action (Button)
        const primaryAction = UI.component('primary_action_component')
            .addSubComponent(UI.component('primary_action_content_subcomponent')
            .addChild(UI.button('get_otp_btn', 'Get OTP')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            weight: 'ExtraBold',
            size: 'text_l',
            color: '#FFFFFF',
            corner_radius: 'radius_l',
            gradient: { start: '#11B6BC', end: '#0B8C91' },
            shadow: 'true',
            height: 'size_m',
            marginTop: 'spacing_xl',
        })
            .setAction('onClick', {
            type: 'navigation',
            payload: {
                destination: 'auth/auth_otp',
                api: 'auth/auth_otp'
            }
        }))
            .addChild(UI.button('skip_btn', 'Skip for now')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            weight: 'Bold',
            size: 'text_m',
            color: '#6B7280',
            style: 'text_only',
            marginTop: 'spacing_m',
            horizontalAlignment: 'center',
        })
            .setAction('onClick', {
            type: 'navigation',
            payload: {
                destination: 'dashboard_template',
                api: 'dashboard/home'
            }
        })));
        // 5. Terms component
        const termsComp = UI.component('terms_component')
            .setProperties({
            horizontalAlignment: 'center',
            marginTop: 'spacing_l',
        })
            .addSubComponent(UI.component('terms_content_subcomponent')
            .setProperties({
            layoutDirection: 'horizontal',
            horizontalArrangement: 'center',
        })
            .addChild(UI.text('terms_text_1', 'By continuing, you agree to our ')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            size: 'text_xs',
            color: '#6B7280',
        }))
            .addChild(UI.text('terms_text_2', 'Terms & Conditions')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            size: 'text_xs',
            color: '#0EA5A8',
            weight: 'ExtraBold',
        })
            .setAction('onClick', {
            type: 'navigation',
            payload: { destination: 'terms_screen' }
        })));
        // Assemble Section
        authSection
            .addComponent(imageBanner)
            .addComponent(pageHeader)
            .addComponent(textInputComp)
            .addComponent(primaryAction)
            .addComponent(termsComp);
        template.addSection(authSection);
        const theme = {
            theme: 'light',
            showBackButton: false,
            statusBar: 'transparent',
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
            screenId: 'auth_login',
            templateId: 'login_layout',
            templateType: 'form_template',
            template,
            theme,
        };
    }
}
//# sourceMappingURL=AuthLoginBuilder.js.map