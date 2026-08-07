import { z } from 'zod';
export declare const childrenDataSchema: z.ZodObject<{
    id: z.ZodString;
    type: z.ZodString;
    properties: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
    action: z.ZodOptional<z.ZodUnion<readonly [z.ZodRecord<z.ZodString, z.ZodAny>, z.ZodAny]>>;
    analytics: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, z.core.$loose>;
export declare const childSchema: z.ZodObject<{
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
}, z.core.$loose>;
export declare const subcomponentSchema: z.ZodObject<{
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
}, z.core.$loose>;
export declare const componentSchema: z.ZodObject<{
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
}, z.core.$loose>;
export declare const sectionSchema: z.ZodObject<{
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
}, z.core.$loose>;
export declare const templateSchema: z.ZodObject<{
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
export declare const themeSchema: z.ZodObject<{
    theme: z.ZodOptional<z.ZodEnum<{
        light: "light";
        dark: "dark";
    }>>;
    showBackButton: z.ZodOptional<z.ZodBoolean>;
    statusBar: z.ZodOptional<z.ZodString>;
    backgroundGradient: z.ZodOptional<z.ZodAny>;
}, z.core.$loose>;
export declare const screenSchema: z.ZodObject<{
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
