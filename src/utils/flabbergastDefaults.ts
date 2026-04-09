import type {
    FlabbergastStyleConfig,
    FlabbergastComponent,
    FlabbergastComponentType,
    FlabbergastPage,
    FlabbergastRoute,
    FlabbergastProject,
    FlabbergastStateModel,
} from "../types";

export function flabbergastCreateDefaultStyleConfig(): FlabbergastStyleConfig {
    return {
        flabbergastColor: "",
        flabbergastBackgroundColor: "",
        flabbergastFontSize: "",
        flabbergastFontFamily: "",
        flabbergastBorder: "",
        flabbergastBorderRadius: "",
        flabbergastPadding: "",
        flabbergastMargin: "",
        flabbergastDisplay: "",
        flabbergastFlexDirection: "",
        flabbergastJustifyContent: "",
        flabbergastAlignItems: "",
        flabbergastGap: "",
    };
}

function flabbergastMakeId(): string {
    return Date.now().toString() + Math.random().toString(36).slice(2);
}

export function flabbergastCreateDefaultComponent(
    type: FlabbergastComponentType,
): FlabbergastComponent {
    return {
        flabbergastId: flabbergastMakeId(),
        flabbergastType: type,
        flabbergastLabel: type,
        flabbergastContent: type === "Header" ? "Heading" : "Text content",
        flabbergastName: "field1",
        flabbergastDefaultValue: "",
        flabbergastOptions: [],
        flabbergastRoute: "",
        flabbergastLevel: 1,
        flabbergastStyle: flabbergastCreateDefaultStyleConfig(),
    };
}

export function flabbergastCreateDefaultPage(name: string): FlabbergastPage {
    return {
        flabbergastId: flabbergastMakeId(),
        flabbergastName: name,
        flabbergastDescription: "",
        flabbergastComponents: [],
        flabbergastPageStyle: flabbergastCreateDefaultStyleConfig(),
        flabbergastAnnotations: [],
        flabbergastStateChanges: "",
        flabbergastX: Math.random() * 300 + 50,
        flabbergastY: Math.random() * 200 + 50,
    };
}

export function flabbergastCreateDefaultRoute(
    name: string,
    sourceId: string,
    targetId: string,
): FlabbergastRoute {
    return {
        flabbergastId: flabbergastMakeId(),
        flabbergastName: name,
        flabbergastSourcePageId: sourceId,
        flabbergastTargetPageId: targetId,
        flabbergastDescription: "",
        flabbergastAnnotations: [],
        flabbergastStateChanges: "",
    };
}

export function flabbergastCreateDefaultStateModel(): FlabbergastStateModel {
    return {
        flabbergastClassName: "State",
        flabbergastAttributes: [],
        flabbergastDataclasses: [],
    };
}

export function flabbergastCreateDefaultProject(
    name: string,
): FlabbergastProject {
    const now = new Date().toISOString();
    const indexPage = flabbergastCreateDefaultPage("index");
    return {
        flabbergastId: flabbergastMakeId(),
        flabbergastName: name,
        flabbergastDescription: "",
        flabbergastCreatedAt: now,
        flabbergastUpdatedAt: now,
        flabbergastPages: [indexPage],
        flabbergastRoutes: [],
        flabbergastState: flabbergastCreateDefaultStateModel(),
    };
}
