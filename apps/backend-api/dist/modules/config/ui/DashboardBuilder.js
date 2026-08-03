import { BaseTemplate, UI, BaseScreenBuilder } from '@carbroz/ui-sdk';
export class DashboardBuilder extends BaseScreenBuilder {
    screenId = 'home';
    async build(context) {
        const isLoggedIn = context?.isLoggedIn ?? false;
        const template = new BaseTemplate('dashboard_layout', 'dashboard_template')
            .setProperties({
            horizontalAlignment: 'center',
        });
        const rootComponent = UI.component('dashboard_root', 'default_component_layout')
            .setProperties({
            width: 'match',
            height: 'match',
            padding: '16',
        });
        // 1. Header Subcomponent
        rootComponent.addSubcomponent(this.buildHeader(isLoggedIn));
        // 2. Search Subcomponent
        rootComponent.addSubcomponent(this.buildSearchBox());
        template.addComponent(rootComponent);
        template.addComponent(this.buildHeroBanner());
        // 4. Services Component
        template.addComponent(this.buildServicesCard());
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
    buildHeader(isLoggedIn) {
        const headerSubcomponent = UI.component('header_main_subcomponent', 'default_subcomponent_layout')
            .setProperties({
            axis: 'ROW',
            mainAxisAlignment: 'SPACE_BETWEEN',
            crossAxisAlignment: 'CENTER',
            width: 'match'
        });
        // LEFT CHILD
        const leftChild = UI.child('header_left_child')
            .setProperties({
            axis: 'ROW',
            crossAxisAlignment: 'CENTER',
            gap: 12
        });
        // Location Avatar Atom
        leftChild.addChildData(UI.component('header_location_avatar', 'atom_avatar')
            .setProperties({
            icon: {
                iconName: 'ic_location',
                imageUrl: 'https://example.com/location_ic.png',
                tint: '#007A53'
            },
            backgroundColor: '#E7F7F9',
            cornerRadius: 50,
            padding: 12,
            width: 48,
            height: 48
        }));
        // Location Text Column
        const textLayout = UI.child('header_location_text_layout')
            .setProperties({
            axis: 'COLUMN',
            crossAxisAlignment: 'START'
        });
        textLayout.addChildData(UI.component('header_location_title', 'atom_text')
            .setProperties({
            text: 'Work',
            textColor: '#000000',
            typography: 'label_large',
            fontWeight: 'BOLD'
        }));
        textLayout.addChildData(UI.component('header_location_subtitle', 'atom_text')
            .setProperties({
            text: 'HSR Layout',
            textColor: '#666666',
            typography: 'body_medium',
            trailing: {
                icon: 'arrow_drop_down',
                tint: '#333333'
            }
        }));
        leftChild.addChildData(textLayout);
        // RIGHT CHILD
        const rightChild = UI.child('header_right_child')
            .setProperties({
            axis: 'ROW',
            crossAxisAlignment: 'CENTER'
        });
        if (isLoggedIn) {
            rightChild.addChildData(UI.component('header_profile_avatar', 'atom_avatar')
                .setProperties({
                icon: {
                    iconName: 'ic_user',
                    imageUrl: 'https://example.com/profile_ic.png',
                    tint: '#007A53'
                },
                backgroundColor: '#F5F5F5',
                cornerRadius: 50,
                padding: 12,
                width: 48,
                height: 48
            }));
        }
        else {
            rightChild.addChildData(UI.component('header_login_btn', 'atom_button')
                .setProperties({
                text: 'Login',
                backgroundColor: '#007A53',
                textColor: '#FFFFFF',
                cornerRadius: 8,
                width: 'wrap',
                height: 'wrap'
            })
                .setSingleAction({
                type: 'navigation',
                payload: { destination: 'form_template', api: 'auth/auth_login' }
            }));
        }
        headerSubcomponent.addChild(leftChild);
        headerSubcomponent.addChild(rightChild);
        return headerSubcomponent;
    }
    buildSearchBox() {
        const searchSubcomponent = UI.component('search_subcomponent', 'default_subcomponent_layout')
            .setProperties({
            axis: 'ROW',
            mainAxisAlignment: 'SPACE_BETWEEN',
            crossAxisAlignment: 'CENTER',
            width: 'match',
            paddingTop: 16
        });
        const searchChild = UI.child('search_child')
            .setProperties({
            axis: 'ROW',
            crossAxisAlignment: 'CENTER',
            width: 'match',
            gap: 12
        });
        searchChild.addChildData(UI.component('search_input_atom', 'atom_input_field')
            .setProperties({
            inputType: 'text',
            hint: 'Search for services...',
            weight: 1,
            height: 'wrap',
            backgroundColor: '#F5F5F5',
            cornerRadius: 12,
            leading: {
                icon: 'ic_search',
                tint: '#666666'
            }
        }));
        searchChild.addChildData(UI.component('search_filter_avatar', 'atom_avatar')
            .setProperties({
            icon: {
                iconName: 'ic_filter',
                imageUrl: '',
                tint: '#FFFFFF'
            },
            backgroundColor: '#007A53',
            cornerRadius: 12,
            padding: 12,
            width: 48,
            height: 48
        }));
        searchSubcomponent.addChild(searchChild);
        return searchSubcomponent;
    }
    buildHeroBanner() {
        const heroComponent = UI.component('hero_component', 'default_component_layout')
            .setProperties({
            width: 'match',
            height: '30%h',
            padding: 16,
            cornerRadius: 16,
            elevation: 4,
            borderWidth: 1,
            borderColor: '#007A53',
            backgroundGradient: {
                colors: [
                    { color: '#B8E3EA', stop: 0.0 },
                    { color: '#D7F1F4', stop: 0.5 },
                    { color: '#F2FBFC', stop: 1.0 }
                ]
            }
        });
        const heroSubcomponent = UI.component('hero_subcomponent', 'default_subcomponent_layout')
            .setProperties({
            axis: 'ROW',
            mainAxisAlignment: 'SPACE_BETWEEN',
            crossAxisAlignment: 'CENTER',
            width: 'match'
        });
        const textChild = UI.child('hero_text_child')
            .setProperties({
            axis: 'COLUMN',
            crossAxisAlignment: 'START',
            weight: 1,
            gap: 8
        });
        textChild.addChildData(UI.component('hero_badge_atom', 'atom_badge')
            .setProperties({
            text: 'EXCLUSIVE OFFER',
            backgroundColor: '#007A53',
            textColor: '#FFFFFF',
            icon: 'sparkles'
        }));
        textChild.addChildData(UI.component('hero_title_atom', 'atom_text')
            .setProperties({
            text: "<font color='#006994'>Flat 50% OFF</font> on\nFirst Premium\nWash",
            isHtml: true,
            textColor: '#111111',
            typography: 'headline_large',
            fontWeight: 'BOLD'
        }));
        textChild.addChildData(UI.component('hero_book_btn_atom', 'atom_button')
            .setProperties({
            text: 'Book Now',
            backgroundColor: '#111111',
            textColor: '#FFFFFF',
            cornerRadius: 50,
            padding: 12,
            marginTop: 8,
            trailing: {
                icon: 'arrow_forward',
                backgroundColor: '#FFFFFF',
                tint: '#111111',
                isCircular: true,
                padding: 4
            }
        }));
        const imageChild = UI.child('hero_image_child')
            .setProperties({
            axis: 'COLUMN',
            crossAxisAlignment: 'CENTER'
        });
        imageChild.addChildData(UI.component('hero_car_image_atom', 'atom_image')
            .setProperties({
            imageUrl: 'http://127.0.0.1:8080/images/car_stars.png',
            width: 120,
            height: 'wrap',
            contentScale: 'FIT'
        }));
        heroSubcomponent.addChild(textChild);
        heroSubcomponent.addChild(imageChild);
        heroComponent.addSubcomponent(heroSubcomponent);
        return heroComponent;
    }
    buildServicesCard() {
        const servicesComponent = UI.component('services_component', 'default_component_layout')
            .setProperties({
            width: 'match',
            height: '20%h',
            padding: 16,
            cornerRadius: 16,
            borderWidth: 1,
            borderColor: '#E0E0E0',
            backgroundColor: '#FFFFFF',
            elevation: 4,
            marginTop: -32,
            marginHorizontal: 16
        });
        const servicesSubcomponent = UI.component('services_subcomponent', 'default_subcomponent_layout')
            .setProperties({
            axis: 'ROW',
            mainAxisAlignment: 'SPACE_BETWEEN',
            crossAxisAlignment: 'CENTER',
            width: 'match',
            height: 'match'
        });
        const addServiceItem = (id, name, icon) => {
            const child = UI.child(`service_${id}_child`)
                .setProperties({
                axis: 'COLUMN',
                crossAxisAlignment: 'CENTER',
                gap: 8
            });
            child.addChildData(UI.component(`service_${id}_avatar`, 'atom_avatar')
                .setProperties({
                icon: { iconName: icon, tint: '#007A53' },
                backgroundColor: '#E7F7F9',
                cornerRadius: 50,
                padding: 16,
                width: 56,
                height: 56
            }));
            child.addChildData(UI.component(`service_${id}_text`, 'atom_text')
                .setProperties({
                text: name,
                textColor: '#111111',
                typography: 'body_small',
                fontWeight: 'BOLD'
            }));
            servicesSubcomponent.addChild(child);
        };
        addServiceItem('wash', 'Full Wash', 'ic_wash');
        addServiceItem('interior', 'Interior', 'ic_interior');
        addServiceItem('exterior', 'Exterior', 'ic_exterior');
        addServiceItem('detailing', 'Detailing', 'ic_detailing');
        const arrowChild = UI.child('service_arrow_child')
            .setProperties({
            axis: 'COLUMN',
            crossAxisAlignment: 'CENTER',
            mainAxisAlignment: 'CENTER'
        });
        arrowChild.addChildData(UI.component('service_arrow_avatar', 'atom_avatar')
            .setProperties({
            icon: { iconName: 'arrow_forward', tint: '#666666' },
            backgroundColor: '#F5F5F5',
            cornerRadius: 50,
            padding: 8,
            width: 40,
            height: 40
        }));
        servicesSubcomponent.addChild(arrowChild);
        servicesComponent.addSubcomponent(servicesSubcomponent);
        return servicesComponent;
    }
}
//# sourceMappingURL=DashboardBuilder.js.map