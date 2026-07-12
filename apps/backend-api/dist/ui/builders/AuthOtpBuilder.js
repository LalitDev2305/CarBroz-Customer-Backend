import { BaseTemplate } from '../templates/BaseTemplate.js';
import { BaseSection } from '../sections/BaseSection.js';
import { UI } from '../utils/UI.js';
import { BaseScreenBuilder } from './BaseScreenBuilder.js';
export class AuthOtpBuilder extends BaseScreenBuilder {
    screenId = 'auth_otp';
    async build(context) {
        const template = new BaseTemplate('otp_layout', 'form_template')
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
            .addChild(UI.text('title_text', 'Verify Your Number')
            .setProperties({
            font_family: 'Poppins',
            size: 'text_huge',
            weight: 'Poppins-SemiBold',
            lineHeight: 'line_height_xl',
            letterSpacing: 'letter_spacing_xs',
            color: '#111827',
            alignment: 'Center',
            marginTop: 'spacing_xxl',
            horizontalAlignment: 'center',
        }))
            .addChild(UI.text('subtitle_text', 'Enter the 4-digit code sent to')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            size: 'text_m',
            weight: 'Medium',
            lineHeight: 'line_height_m',
            color: '#6B7280',
            alignment: 'Center',
            marginTop: 'spacing_s',
            horizontalAlignment: 'center',
        })));
        // 3. Labeled Info Component (Phone Number + Edit Icon)
        const labeledInfo = UI.component('labeled_info_component')
            .setProperties({
            horizontalArrangement: 'center',
            verticalAlignment: 'center',
            marginTop: 'spacing_m',
        })
            .addSubComponent(UI.component('labeled_info_content_subcomponent')
            .setProperties({
            layoutDirection: 'horizontal',
            horizontalArrangement: 'center',
            verticalAlignment: 'center',
        })
            .addChild(UI.text('phone_text', '+91 98765 43210')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            weight: 'ExtraBold',
            size: 'text_xl',
            color: '#111827',
            horizontalAlignment: 'center',
        }))
            .addChild(UI.icon('edit_icon', 'edit')
            .setProperties({
            width: 'icon_m',
            height: 'icon_m',
            color: '#0EA5A8',
            marginStart: 'spacing_s',
        })));
        // 4. Text Input Component (OTP Boxes)
        const textInputComp = UI.component('text_input_component')
            .addSubComponent(UI.component('text_input_content_subcomponent')
            .addChild(UI.input('otp_boxes', 'otp_custom')
            .setProperties({
            length: '4',
            corner_radius: 'radius_m',
            border: '#D7EEF0',
            focus_border: '#0EA5A8',
            size: 'text_xxl',
            weight: 'ExtraBold',
            color: '#111827',
            box_spacing: 'spacing_m',
            box_size: 'size_l',
            marginTop: 'spacing_xl',
            width: 'fill_max_width',
        })
            .setAction('onChange', {
            type: 'verify_otp',
            payload: { destination: 'm1_07_existing_user_check' }
        })));
        // 5. Timer Action (Resend OTP)
        const timerAction = UI.component('timer_action_component')
            .addSubComponent(UI.component('timer_action_content_subcomponent')
            .addChild(UI.component('resend_row', 'resend_timer')
            .setProperties({
            timer_text: 'Resend OTP in ',
            timer_seconds: '25',
            timer_color: '#6B7280',
            action_text: 'Resend OTP',
            action_color: '#0EA5A8',
            resending_text: 'Resending OTP...',
            size: 'text_m',
            marginTop: 'spacing_xl',
            width: 'fill_max_width',
        })
            .setAction('onClick', {
            type: 'api_call',
            payload: { endpoint: '/api/v1/resend-otp' }
        })));
        // 6. Primary Action Component (Continue Button)
        const primaryAction = UI.component('primary_action_component')
            .addSubComponent(UI.component('primary_action_content_subcomponent')
            .addChild(UI.button('continue_btn', 'Continue')
            .setProperties({
            font_family: 'Plus Jakarta Sans',
            weight: 'ExtraBold',
            size: 'text_l',
            color: '#FFFFFF',
            corner_radius: 'radius_l',
            gradient: { start: '#11B6BC', end: '#0B8C91' },
            shadow: 'true',
            height: 'size_m',
            marginTop: 'spacing_xxl',
        })
            .setAction('onClick', {
            type: 'verify_otp',
            payload: {
                destination: 'dashboard_template',
                api: 'dashboard/home'
            }
        })));
        // Assemble Section
        authSection
            .addComponent(imageBanner)
            .addComponent(pageHeader)
            .addComponent(labeledInfo)
            .addComponent(textInputComp)
            .addComponent(timerAction)
            .addComponent(primaryAction);
        template.addSection(authSection);
        const theme = {
            theme: 'light',
            showBackButton: true,
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
            screenId: 'otp_verification_screen',
            templateId: 'otp_layout',
            templateType: 'form_template',
            template,
            theme,
        };
    }
}
//# sourceMappingURL=AuthOtpBuilder.js.map