import { z } from 'zod';
export declare const sduiJsonContractSchema: z.ZodObject<{
    screenId: z.ZodString;
    templateId: z.ZodString;
    templateType: z.ZodString;
    template: z.ZodObject<{
        id: z.ZodOptional<z.ZodString>;
        type: z.ZodOptional<z.ZodString>;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            components: z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>;
        }, z.core.$loose>>>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>;
    components: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
        subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>>;
    subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>>;
    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
    }, z.core.$loose>>>;
    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        type: z.ZodString;
        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    }, z.core.$loose>>>;
    theme: z.ZodOptional<z.ZodObject<{
        theme: z.ZodOptional<z.ZodEnum<{
            light: "light";
            dark: "dark";
        }>>;
        showBackButton: z.ZodOptional<z.ZodBoolean>;
        statusBar: z.ZodOptional<z.ZodString>;
        backgroundGradient: z.ZodOptional<z.ZodAny>;
    }, z.core.$loose>>;
}, z.core.$loose>;
export type SduiJsonContract = z.infer<typeof sduiJsonContractSchema>;
export declare const getSduiScreenSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        CUSTOMER: "CUSTOMER";
        PARTNER: "PARTNER";
        ADMIN: "ADMIN";
    }>>>;
}, z.core.$strip>;
export type GetSduiScreenDto = z.input<typeof getSduiScreenSchema>;
export declare const updateSduiScreenSchema: z.ZodObject<{
    screenId: z.ZodString;
    targetApp: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        CUSTOMER: "CUSTOMER";
        PARTNER: "PARTNER";
        ADMIN: "ADMIN";
    }>>>;
    layoutJson: z.ZodObject<{
        screenId: z.ZodString;
        templateId: z.ZodString;
        templateType: z.ZodString;
        template: z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                components: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                type: z.ZodString;
                                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            }, z.core.$loose>>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                    subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                type: z.ZodString;
                                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            }, z.core.$loose>>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>;
            }, z.core.$loose>>>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
        theme: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodEnum<{
                light: "light";
                dark: "dark";
            }>>;
            showBackButton: z.ZodOptional<z.ZodBoolean>;
            statusBar: z.ZodOptional<z.ZodString>;
            backgroundGradient: z.ZodOptional<z.ZodAny>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
    isPublished: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
export type UpdateSduiScreenDto = z.input<typeof updateSduiScreenSchema>;
export declare const registerSduiComponentSchema: z.ZodObject<{
    name: z.ZodString;
    nodeLevel: z.ZodDefault<z.ZodOptional<z.ZodEnum<{
        COMPONENT: "COMPONENT";
        SUBCOMPONENT: "SUBCOMPONENT";
        CHILD: "CHILD";
        CHILDREN_DATA: "CHILDREN_DATA";
    }>>>;
    componentType: z.ZodString;
    schemaJson: z.ZodRecord<z.ZodString, z.ZodAny>;
    supportedProperties: z.ZodOptional<z.ZodArray<z.ZodString>>;
    supportedActions: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export type RegisterSduiComponentDto = z.input<typeof registerSduiComponentSchema>;
export declare const upsertSduiTemplateSchema: z.ZodObject<{
    templateId: z.ZodString;
    templateType: z.ZodString;
    defaultLayoutJson: z.ZodObject<{
        screenId: z.ZodString;
        templateId: z.ZodString;
        templateType: z.ZodString;
        template: z.ZodObject<{
            id: z.ZodOptional<z.ZodString>;
            type: z.ZodOptional<z.ZodString>;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            sections: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                components: z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                type: z.ZodString;
                                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            }, z.core.$loose>>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                    subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                                id: z.ZodString;
                                type: z.ZodString;
                                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            }, z.core.$loose>>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>;
            }, z.core.$loose>>>;
            components: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                            id: z.ZodString;
                            type: z.ZodString;
                            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        }, z.core.$loose>>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>;
        components: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            subComponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                        id: z.ZodString;
                        type: z.ZodString;
                        properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                        action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                        analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    }, z.core.$loose>>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        subcomponents: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            children: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                    id: z.ZodString;
                    type: z.ZodString;
                    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                }, z.core.$loose>>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        children: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
                id: z.ZodString;
                type: z.ZodString;
                properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
                action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
                analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            }, z.core.$loose>>>;
        }, z.core.$loose>>>;
        childrenData: z.ZodOptional<z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            type: z.ZodString;
            properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
            action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
            analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
        }, z.core.$loose>>>;
        theme: z.ZodOptional<z.ZodObject<{
            theme: z.ZodOptional<z.ZodEnum<{
                light: "light";
                dark: "dark";
            }>>;
            showBackButton: z.ZodOptional<z.ZodBoolean>;
            statusBar: z.ZodOptional<z.ZodString>;
            backgroundGradient: z.ZodOptional<z.ZodAny>;
        }, z.core.$loose>>;
    }, z.core.$loose>;
}, z.core.$strip>;
export type UpsertSduiTemplateDto = z.input<typeof upsertSduiTemplateSchema>;
