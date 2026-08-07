import { IScreen, UITheme, BaseTemplate, UI, BaseScreenBuilder, BuildContext } from '@carbroz/sdui-engine';


export class AuthOtpBuilder extends BaseScreenBuilder {
  public readonly screenId = 'auth_otp';

  public async build(context?: BuildContext): Promise<IScreen> {
    const template = new BaseTemplate('otp_main', 'form_template')
      .setProperties({
        padding: '16',
      });

    const rootComponent = UI.component('otp_root_component', 'default_component_layout')
      .setProperties({
        width: 'match',
        height: 'match',
        backgroundColor: 'transparent'
      });

    const mainSubcomponent = UI.component('otp_main_subcomponent', 'default_subcomponent_layout')
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
    const topSection = UI.component('otp_top_section', 'default_child_layout')
      .setProperties({
        axis: 'COLUMN',
        mainAxisAlignment: 'START',
        crossAxisAlignment: 'CENTER',
        gap: 24,
        width: 'match',
        height: 'wrap'
      });

    topSection.addChildData(
      UI.component('otp_logo_atom', 'atom_image')
        .setProperties({
          imageUrl: 'http://127.0.0.1:8080/images/carbroz_logo.png',
          width: '80%w',
          height: '25%h',
          contentScale: 'FIT'
        })
    );

    topSection.addChildData(
      UI.component('otp_tagline_atom', 'atom_text')
        .setProperties({
          text: 'Your Car Our Care \n At Your Door Step',
          textColor: '#666666',
          fontSize: 14,
          font: 'Inter',
          style: 'NORMAL',
          typography: 'body_medium',
          textAlign: 'CENTER',
          marginTop: -16
        })
    );

    topSection.addChildData(
      UI.component('otp_circle_icon_atom', 'atom_avatar')
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
        })
    );

    topSection.addChildData(
      UI.component('otp_verify_atom', 'atom_text')
        .setProperties({
          text: 'Verify your phone number',
          textColor: '#000000',
          fontSize: 24,
          font: 'Inter',
          style: 'NORMAL',
          typography: 'heading_large',
          fontWeight: 'BOLD',
          textAlign: 'CENTER'
        })
    );

    topSection.addChildData(
      UI.component('otp_phone_number_text', 'atom_text')
        .setProperties({
          text: '+91 9876543210',
          textColor: '#666666',
          fontSize: 16,
          font: 'Inter',
          style: 'NORMAL',
          typography: 'body_large',
          marginTop: -16,
          trailing: {
            icon: 'ic_edit',
            tint: '#007A53',
            action: {
              type: 'navigate',
              payload: {
                screenId: 'auth_login'
              }
            }
          }
        })
    );

    topSection.addChildData(
      UI.component('otp', 'atom_otp_input')
        .setProperties({
          boxCount: 6,
          textColor: '#000000',
          cursorColor: '#007A53',
          keyboardType: 'NUMBER',
          borderColor: '#E0E0E0',
          focusedBorderColor: '#007A53',
          width: 'match',
          height: 'wrap'
        })
    );

    const resendRow = UI.component('otp_resend_row', 'default_child_layout')
      .setProperties({
        axis: 'ROW',
        mainAxisAlignment: 'SPACE_BETWEEN',
        crossAxisAlignment: 'CENTER',
        width: 'match',
        height: 'wrap'
      });

    resendRow.addChildData(
      UI.component('otp_timer_text', 'atom_text')
        .setProperties({
          text: 'Resending OTP in 00:30',
          textColor: '#666666',
          fontSize: 14,
          font: 'Inter',
          style: 'NORMAL',
          typography: 'body_medium',
          visible: false
        })
    );

    resendRow.addChildData(
      UI.component('otp_resend_text', 'atom_text')
        .setProperties({
          text: 'Resend',
          textColor: '#007A53',
          fontSize: 14,
          font: 'Inter',
          style: 'NORMAL',
          typography: 'body_medium_bold',
          fontWeight: 'BOLD'
        })
        .setSingleAction({
          type: 'update_child',
          targetId: 'otp_timer_text',
          payload: {
            visible: true
          }
        })
    );

    topSection.addChildData(resendRow);

    topSection.addChildData(
      UI.component('otp_verify_btn', 'atom_button')
        .setProperties({
          text: 'Verify OTP',
          backgroundColor: '#007A53',
          textColor: '#FFFFFF',
          width: 'match',
          height: 'wrap',
          cornerRadius: 8
        })
        .setSingleAction({
          type: 'api_call',
          payload: {
            endpoint: 'auth/verify_otp',
            method: 'POST'
          }
        })
    );

    // Bottom Section
    const bottomSection = UI.component('otp_bottom_section', 'default_child_layout')
      .setProperties({
        axis: 'COLUMN',
        mainAxisAlignment: 'END',
        crossAxisAlignment: 'CENTER',
        width: 'match',
        height: 'wrap'
      });

    bottomSection.addChildData(
      UI.component('otp_bottom_image_atom', 'atom_image')
        .setProperties({
          imageUrl: 'http://127.0.0.1:8080/images/car_stars.png',
          width: 'match',
          height: 'wrap',
          contentScale: 'FIT'
        })
    );

    mainSubcomponent.addChild(topSection);
    mainSubcomponent.addChild(bottomSection);

    rootComponent.addSubcomponent(mainSubcomponent);
    template.addComponent(rootComponent);

    const theme: UITheme = {
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
      screenId: 'auth_otp',
      templateId: 'auth_layout',
      templateType: 'form_template',
      template,
      theme,
    };
  }
}
