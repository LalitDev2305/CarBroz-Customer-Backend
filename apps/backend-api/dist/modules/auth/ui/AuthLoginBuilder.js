import { BaseTemplate, UI, BaseScreenBuilder } from '@carbroz/ui-sdk';
export class AuthLoginBuilder extends BaseScreenBuilder {
    screenId = 'auth_login';
    async build(context) {
        const template = new BaseTemplate('login_main', 'form_template')
            .setProperties({
            padding: '16',
        });
        const rootComponent = UI.component('login_root_component', 'default_component_layout')
            .setProperties({
            width: 'match',
            height: 'match',
            backgroundColor: 'transparent'
        });
        const mainSubcomponent = UI.component('login_main_subcomponent', 'default_subcomponent_layout')
            .setProperties({
            axis: 'COLUMN',
            mainAxisAlignment: 'SPACE_BETWEEN',
            crossAxisAlignment: 'CENTER',
            width: 'match',
            height: 'match',
            padding: 0,
            margin: 0
        });
        // Top Section
        const topSection = UI.child('login_top_section')
            .setProperties({
            axis: 'COLUMN',
            mainAxisAlignment: 'START',
            crossAxisAlignment: 'CENTER',
            gap: 24,
            width: 'match',
            height: 'wrap'
        });
        topSection.addChildData(UI.component('login_logo_atom', 'atom_image')
            .setProperties({
            imageUrl: 'http://127.0.0.1:8080/images/carbroz_logo.png',
            width: '80%w',
            height: '25%h',
            contentScale: 'FIT'
        }));
        topSection.addChildData(UI.component('login_tagline_atom', 'atom_text')
            .setProperties({
            text: 'Your Car Our Care \n At Your Door Step',
            textColor: '#666666',
            fontSize: 14,
            font: 'Inter',
            style: 'NORMAL',
            typography: 'body_medium',
            textAlign: 'CENTER',
            marginTop: -16
        }));
        topSection.addChildData(UI.component('login_circle_icon_atom', 'atom_avatar')
            .setProperties({
            icon: {
                iconName: 'ic_user',
                imageUrl: '',
                tint: '#007A53'
            },
            backgroundColor: '#E7F7F9',
            cornerRadius: 50,
            padding: 16,
            width: 64,
            height: 64
        }));
        topSection.addChildData(UI.component('login_welcome_atom', 'atom_text')
            .setProperties({
            text: 'Welcome Back!',
            textColor: '#000000',
            fontSize: 24,
            font: 'Inter',
            style: 'NORMAL',
            typography: 'heading_large',
            fontWeight: 'BOLD'
        }));
        topSection.addChildData(UI.component('login_subtitle_atom', 'atom_text')
            .setProperties({
            text: 'Login to continue',
            textColor: '#666666',
            fontSize: 16,
            font: 'Inter',
            style: 'NORMAL',
            typography: 'body_large',
            marginTop: -16
        }));
        topSection.addChildData(UI.component('phoneNumber', 'atom_input_field')
            .setProperties({
            inputType: 'phone',
            hint: 'Phone Number',
            showCountryPicker: true,
            defaultCountryCode: '+91',
            width: 'match',
            height: 'wrap'
        }));
        topSection.addChildData(UI.component('login_get_otp_btn', 'atom_button')
            .setProperties({
            text: 'Continue',
            backgroundColor: '#007A53',
            textColor: '#FFFFFF',
            width: 'match',
            height: 'wrap',
            cornerRadius: 8
        })
            .setSingleAction({
            type: 'api_call',
            payload: {
                endpoint: 'auth/send_otp',
                method: 'POST'
            }
        }));
        // Bottom Section
        const bottomSection = UI.child('login_bottom_section')
            .setProperties({
            axis: 'COLUMN',
            mainAxisAlignment: 'END',
            crossAxisAlignment: 'CENTER',
            width: 'match',
            height: 'wrap'
        });
        bottomSection.addChildData(UI.component('login_bottom_image_atom', 'atom_image')
            .setProperties({
            imageUrl: 'http://127.0.0.1:8080/images/car_stars.png',
            width: 'match',
            height: 'wrap',
            contentScale: 'FIT'
        }));
        mainSubcomponent.addChild(topSection);
        mainSubcomponent.addChild(bottomSection);
        rootComponent.addSubcomponent(mainSubcomponent);
        template.addComponent(rootComponent);
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
                    { color: '#FBFEFE', stop: 1.0 }
                ]
            }
        };
        return {
            screenId: 'auth_login',
            templateId: 'auth_layout',
            templateType: 'form_template',
            template,
            theme,
        };
    }
}
//# sourceMappingURL=AuthLoginBuilder.js.map