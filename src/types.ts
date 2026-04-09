// All TypeScript types/interfaces for the Drafter Designer

export type FlabbergastComponentType =
    | "Text"
    | "TextBox"
    | "TextArea"
    | "CheckBox"
    | "SelectBox"
    | "Button"
    | "Header";

export interface FlabbergastStyleConfig {
    flabbergastColor: string;
    flabbergastBackgroundColor: string;
    flabbergastFontSize: string;
    flabbergastFontFamily: string;
    flabbergastBorder: string;
    flabbergastBorderRadius: string;
    flabbergastPadding: string;
    flabbergastMargin: string;
    flabbergastDisplay: string;
    flabbergastFlexDirection: string;
    flabbergastJustifyContent: string;
    flabbergastAlignItems: string;
    flabbergastGap: string;
}

export interface FlabbergastComponent {
    flabbergastId: string;
    flabbergastType: FlabbergastComponentType;
    flabbergastLabel: string;
    flabbergastContent: string;
    flabbergastName: string;
    flabbergastDefaultValue: string;
    flabbergastOptions: string[];
    flabbergastRoute: string;
    flabbergastLevel: number;
    flabbergastStyle: FlabbergastStyleConfig;
}

export interface FlabbergastAnnotation {
    flabbergastId: string;
    flabbergastKind: "if" | "for";
    flabbergastDescription: string;
}

export interface FlabbergastPage {
    flabbergastId: string;
    flabbergastName: string;
    flabbergastDescription: string;
    flabbergastComponents: FlabbergastComponent[];
    flabbergastPageStyle: FlabbergastStyleConfig;
    flabbergastAnnotations: FlabbergastAnnotation[];
    flabbergastStateChanges: string;
    flabbergastX: number;
    flabbergastY: number;
}

export interface FlabbergastRoute {
    flabbergastId: string;
    flabbergastName: string;
    flabbergastSourcePageId: string;
    flabbergastTargetPageId: string;
    flabbergastDescription: string;
    flabbergastAnnotations: FlabbergastAnnotation[];
    flabbergastStateChanges: string;
}

export interface FlabbergastStateAttribute {
    flabbergastId: string;
    flabbergastName: string;
    flabbergastType: string;
    flabbergastDescription: string;
    flabbergastDefaultValue: string;
}

export interface FlabbergastDataclass {
    flabbergastId: string;
    flabbergastName: string;
    flabbergastAttributes: FlabbergastStateAttribute[];
}

export interface FlabbergastStateModel {
    flabbergastClassName: string;
    flabbergastAttributes: FlabbergastStateAttribute[];
    flabbergastDataclasses: FlabbergastDataclass[];
}

export interface FlabbergastProject {
    flabbergastId: string;
    flabbergastName: string;
    flabbergastDescription: string;
    flabbergastCreatedAt: string;
    flabbergastUpdatedAt: string;
    flabbergastPages: FlabbergastPage[];
    flabbergastRoutes: FlabbergastRoute[];
    flabbergastState: FlabbergastStateModel;
}
