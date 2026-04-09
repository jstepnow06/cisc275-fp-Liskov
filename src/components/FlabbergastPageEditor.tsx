import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Button,
    Form,
    Badge,
    Breadcrumb,
} from "react-bootstrap";
import {
    flabbergastLoadProjects,
    flabbergastSaveProjects,
} from "../utils/flabbergastStorage";
import { flabbergastCreateDefaultComponent } from "../utils/flabbergastDefaults";
import type {
    FlabbergastProject,
    FlabbergastPage,
    FlabbergastComponent,
    FlabbergastComponentType,
    FlabbergastAnnotation,
    FlabbergastStyleConfig,
} from "../types";

const FLABBERGAST_COMPONENT_TYPES: FlabbergastComponentType[] = [
    "Text",
    "TextBox",
    "TextArea",
    "CheckBox",
    "SelectBox",
    "Button",
    "Header",
];

function flabbergastMakeAnnId(): string {
    return Date.now().toString() + Math.random().toString(36).slice(2);
}

function flabbergastStyleToReact(
    style: FlabbergastStyleConfig,
): React.CSSProperties {
    return {
        color: style.flabbergastColor || undefined,
        backgroundColor: style.flabbergastBackgroundColor || undefined,
        fontSize: style.flabbergastFontSize || undefined,
        fontFamily: style.flabbergastFontFamily || undefined,
        border: style.flabbergastBorder || undefined,
        borderRadius: style.flabbergastBorderRadius || undefined,
        padding: style.flabbergastPadding || undefined,
        margin: style.flabbergastMargin || undefined,
        display: style.flabbergastDisplay || undefined,
        flexDirection:
            (style.flabbergastFlexDirection as React.CSSProperties["flexDirection"]) ||
            undefined,
        justifyContent: style.flabbergastJustifyContent || undefined,
        alignItems: style.flabbergastAlignItems || undefined,
        gap: style.flabbergastGap || undefined,
    };
}

function FlabbergastComponentPreview({
    comp,
    selected,
    onClick,
}: {
    comp: FlabbergastComponent;
    selected: boolean;
    onClick: () => void;
}) {
    const style = flabbergastStyleToReact(comp.flabbergastStyle);
    const boxStyle: React.CSSProperties = {
        ...style,
        outline: selected ? "2px solid #0d6efd" : "1px dashed #aaa",
        cursor: "pointer",
        padding: style.padding ?? "4px",
        marginBottom: "4px",
    };

    switch (comp.flabbergastType) {
        case "Header": {
            const Tag =
                `h${comp.flabbergastLevel.toString()}` as keyof React.JSX.IntrinsicElements;
            return (
                <div style={boxStyle} onClick={onClick}>
                    <Tag>{comp.flabbergastContent}</Tag>
                </div>
            );
        }
        case "Text":
            return (
                <div style={boxStyle} onClick={onClick}>
                    <span>{comp.flabbergastContent}</span>
                </div>
            );
        case "TextBox":
            return (
                <div style={boxStyle} onClick={onClick}>
                    <label className="d-block small">{comp.flabbergastLabel}</label>
                    <input
                        readOnly
                        placeholder={comp.flabbergastDefaultValue}
                        className="form-control form-control-sm"
                    />
                </div>
            );
        case "TextArea":
            return (
                <div style={boxStyle} onClick={onClick}>
                    <label className="d-block small">{comp.flabbergastLabel}</label>
                    <textarea
                        readOnly
                        placeholder={comp.flabbergastDefaultValue}
                        className="form-control form-control-sm"
                        rows={2}
                    />
                </div>
            );
        case "CheckBox":
            return (
                <div style={boxStyle} onClick={onClick}>
                    <input type="checkbox" readOnly className="me-1" />
                    <label>{comp.flabbergastLabel}</label>
                </div>
            );
        case "SelectBox":
            return (
                <div style={boxStyle} onClick={onClick}>
                    <label className="d-block small">{comp.flabbergastLabel}</label>
                    <select className="form-select form-select-sm">
                        {comp.flabbergastOptions.map((o) => (
                            <option key={o}>{o}</option>
                        ))}
                    </select>
                </div>
            );
        case "Button":
            return (
                <div style={boxStyle} onClick={onClick}>
                    <button className="btn btn-sm btn-primary">
                        {comp.flabbergastLabel}
                    </button>
                </div>
            );
    }
}

function FlabbergastComponentConfig({
    comp,
    routes,
    onUpdate,
    onDelete,
    onMoveUp,
    onMoveDown,
}: {
    comp: FlabbergastComponent;
    routes: { id: string; name: string }[];
    onUpdate: (c: FlabbergastComponent) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
}) {
    function flabbergastUpdateStyle(key: keyof FlabbergastStyleConfig, val: string) {
        onUpdate({ ...comp, flabbergastStyle: { ...comp.flabbergastStyle, [key]: val } });
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-2">
                <strong>{comp.flabbergastType}</strong>
                <div>
                    <Button size="sm" variant="outline-secondary" className="me-1" onClick={onMoveUp}>▲</Button>
                    <Button size="sm" variant="outline-secondary" className="me-1" onClick={onMoveDown}>▼</Button>
                    <Button size="sm" variant="danger" onClick={onDelete}>Del</Button>
                </div>
            </div>

            {(comp.flabbergastType === "Text" || comp.flabbergastType === "Header") && (
                <Form.Group className="mb-2">
                    <Form.Label className="small">Content</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={2}
                        value={comp.flabbergastContent}
                        onChange={(e) =>
                            onUpdate({ ...comp, flabbergastContent: e.target.value })
                        }
                    />
                </Form.Group>
            )}

            {comp.flabbergastType === "Header" && (
                <Form.Group className="mb-2">
                    <Form.Label className="small">Level</Form.Label>
                    <Form.Select
                        value={comp.flabbergastLevel}
                        onChange={(e) =>
                            onUpdate({ ...comp, flabbergastLevel: Number(e.target.value) })
                        }
                    >
                        {[1, 2, 3, 4, 5, 6].map((n) => (
                            <option key={n} value={n}>{n}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
            )}

            {(comp.flabbergastType === "TextBox" ||
                comp.flabbergastType === "TextArea") && (
                <>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Label</Form.Label>
                        <Form.Control
                            value={comp.flabbergastLabel}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastLabel: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Name</Form.Label>
                        <Form.Control
                            value={comp.flabbergastName}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastName: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Default value</Form.Label>
                        <Form.Control
                            value={comp.flabbergastDefaultValue}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastDefaultValue: e.target.value })
                            }
                        />
                    </Form.Group>
                </>
            )}

            {comp.flabbergastType === "CheckBox" && (
                <>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Label</Form.Label>
                        <Form.Control
                            value={comp.flabbergastLabel}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastLabel: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Name</Form.Label>
                        <Form.Control
                            value={comp.flabbergastName}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastName: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Default value</Form.Label>
                        <Form.Select
                            value={comp.flabbergastDefaultValue}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastDefaultValue: e.target.value })
                            }
                        >
                            <option value="false">false</option>
                            <option value="true">true</option>
                        </Form.Select>
                    </Form.Group>
                </>
            )}

            {comp.flabbergastType === "SelectBox" && (
                <>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Label</Form.Label>
                        <Form.Control
                            value={comp.flabbergastLabel}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastLabel: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Name</Form.Label>
                        <Form.Control
                            value={comp.flabbergastName}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastName: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Options (comma-separated)</Form.Label>
                        <Form.Control
                            value={comp.flabbergastOptions.join(",")}
                            onChange={(e) =>
                                onUpdate({
                                    ...comp,
                                    flabbergastOptions: e.target.value.split(",").map((s) => s.trim()),
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Default value</Form.Label>
                        <Form.Control
                            value={comp.flabbergastDefaultValue}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastDefaultValue: e.target.value })
                            }
                        />
                    </Form.Group>
                </>
            )}

            {comp.flabbergastType === "Button" && (
                <>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Label</Form.Label>
                        <Form.Control
                            value={comp.flabbergastLabel}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastLabel: e.target.value })
                            }
                        />
                    </Form.Group>
                    <Form.Group className="mb-2">
                        <Form.Label className="small">Route</Form.Label>
                        <Form.Select
                            value={comp.flabbergastRoute}
                            onChange={(e) =>
                                onUpdate({ ...comp, flabbergastRoute: e.target.value })
                            }
                        >
                            <option value="">None</option>
                            {routes.map((r) => (
                                <option key={r.id} value={"/" + r.name}>{r.name}</option>
                            ))}
                        </Form.Select>
                    </Form.Group>
                </>
            )}

            <hr className="my-2" />
            <p className="small fw-bold mb-1">Component Style</p>
            {(
                [
                    ["flabbergastColor", "Color"],
                    ["flabbergastBackgroundColor", "Background"],
                    ["flabbergastFontSize", "Font Size"],
                    ["flabbergastBorder", "Border"],
                    ["flabbergastPadding", "Padding"],
                    ["flabbergastMargin", "Margin"],
                ] as [keyof FlabbergastStyleConfig, string][]
            ).map(([key, label]) => (
                <Form.Group key={key} className="mb-1">
                    <Form.Label className="small">{label}</Form.Label>
                    <Form.Control
                        size="sm"
                        value={comp.flabbergastStyle[key]}
                        onChange={(e) => flabbergastUpdateStyle(key, e.target.value)}
                    />
                </Form.Group>
            ))}
        </div>
    );
}

export function FlabbergastPageEditor() {
    const { id, pageId } = useParams<{ id: string; pageId: string }>();

    const [flabbergastProject, setFlabbergastProject] =
        useState<FlabbergastProject | null>(() => {
            const all = flabbergastLoadProjects();
            return all.find((p) => p.flabbergastId === id) ?? null;
        });

    const [flabbergastSelectedId, setFlabbergastSelectedId] = useState<
        string | null
    >(null);

    if (!flabbergastProject) {
        return <Container className="py-3"><p>Project not found.</p></Container>;
    }

    const flabbergastPage: FlabbergastPage | undefined =
        flabbergastProject.flabbergastPages.find(
            (p) => p.flabbergastId === pageId,
        );

    if (!flabbergastPage) {
        return <Container className="py-3"><p>Page not found.</p></Container>;
    }

    // Capture narrowed type so closures can reference it safely
    const flabbergastCurrentPage: FlabbergastPage = flabbergastPage;

    function flabbergastPersistProject(updated: FlabbergastProject) {
        const all = flabbergastLoadProjects();
        const next = all.map((p) =>
            p.flabbergastId === updated.flabbergastId ? updated : p,
        );
        flabbergastSaveProjects(next);
        setFlabbergastProject(updated);
    }

    function flabbergastUpdatePage(updatedPage: FlabbergastPage) {
        if (!flabbergastProject) return;
        const updatedProject: FlabbergastProject = {
            ...flabbergastProject,
            flabbergastPages: flabbergastProject.flabbergastPages.map((p) =>
                p.flabbergastId === updatedPage.flabbergastId ? updatedPage : p,
            ),
        };
        flabbergastPersistProject(updatedProject);
    }

    function flabbergastAddComponent(type: FlabbergastComponentType) {
        const comp = flabbergastCreateDefaultComponent(type);
        flabbergastUpdatePage({
            ...flabbergastCurrentPage,
            flabbergastComponents: [...flabbergastCurrentPage.flabbergastComponents, comp],
        });
        setFlabbergastSelectedId(comp.flabbergastId);
    }

    function flabbergastUpdateComponent(updated: FlabbergastComponent) {
        flabbergastUpdatePage({
            ...flabbergastCurrentPage,
            flabbergastComponents: flabbergastCurrentPage.flabbergastComponents.map((c) =>
                c.flabbergastId === updated.flabbergastId ? updated : c,
            ),
        });
    }

    function flabbergastDeleteComponent(cId: string) {
        flabbergastUpdatePage({
            ...flabbergastCurrentPage,
            flabbergastComponents: flabbergastCurrentPage.flabbergastComponents.filter(
                (c) => c.flabbergastId !== cId,
            ),
        });
        setFlabbergastSelectedId(null);
    }

    function flabbergastMoveComponent(cId: string, dir: -1 | 1) {
        const comps = [...flabbergastCurrentPage.flabbergastComponents];
        const idx = comps.findIndex((c) => c.flabbergastId === cId);
        if (idx < 0) return;
        const next = idx + dir;
        if (next < 0 || next >= comps.length) return;
        const temp = comps[idx];
        comps[idx] = comps[next];
        comps[next] = temp;
        flabbergastUpdatePage({ ...flabbergastCurrentPage, flabbergastComponents: comps });
    }

    function flabbergastAddAnnotation(kind: "if" | "for") {
        const ann: FlabbergastAnnotation = {
            flabbergastId: flabbergastMakeAnnId(),
            flabbergastKind: kind,
            flabbergastDescription: "",
        };
        flabbergastUpdatePage({
            ...flabbergastCurrentPage,
            flabbergastAnnotations: [...flabbergastCurrentPage.flabbergastAnnotations, ann],
        });
    }

    function flabbergastDeleteAnnotation(annId: string) {
        flabbergastUpdatePage({
            ...flabbergastCurrentPage,
            flabbergastAnnotations: flabbergastCurrentPage.flabbergastAnnotations.filter(
                (a) => a.flabbergastId !== annId,
            ),
        });
    }

    function flabbergastUpdateAnnotation(annId: string, desc: string) {
        flabbergastUpdatePage({
            ...flabbergastCurrentPage,
            flabbergastAnnotations: flabbergastCurrentPage.flabbergastAnnotations.map(
                (a) => a.flabbergastId === annId ? { ...a, flabbergastDescription: desc } : a,
            ),
        });
    }

    const flabbergastSelectedComp =
        flabbergastCurrentPage.flabbergastComponents.find(
            (c) => c.flabbergastId === flabbergastSelectedId,
        ) ?? null;

    const flabbergastRouteOptions = flabbergastProject.flabbergastRoutes.map(
        (r) => ({ id: r.flabbergastId, name: r.flabbergastName }),
    );

    const flabbergastPageStyle = flabbergastStyleToReact(
        flabbergastCurrentPage.flabbergastPageStyle,
    );

    return (
        <Container fluid className="py-3">
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item
                    linkAs={Link}
                    linkProps={{ to: `/project/${id ?? ""}` }}
                >
                    {flabbergastProject.flabbergastName}
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    {flabbergastCurrentPage.flabbergastName}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row className="mb-2">
                <Col md={5}>
                    <Form.Group className="mb-1">
                        <Form.Label className="small fw-bold">Page Name</Form.Label>
                        <Form.Control
                            value={flabbergastCurrentPage.flabbergastName}
                            onChange={(e) =>
                                flabbergastUpdatePage({
                                    ...flabbergastCurrentPage,
                                    flabbergastName: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                </Col>
                <Col md={7}>
                    <Form.Group className="mb-1">
                        <Form.Label className="small fw-bold">Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={flabbergastCurrentPage.flabbergastDescription}
                            onChange={(e) =>
                                flabbergastUpdatePage({
                                    ...flabbergastCurrentPage,
                                    flabbergastDescription: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-2">
                <Col>
                    <Form.Group>
                        <Form.Label className="small fw-bold">State Changes</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={1}
                            value={flabbergastCurrentPage.flabbergastStateChanges}
                            onChange={(e) =>
                                flabbergastUpdatePage({
                                    ...flabbergastCurrentPage,
                                    flabbergastStateChanges: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                </Col>
            </Row>

            <Row className="mb-2 align-items-center">
                <Col>
                    {flabbergastCurrentPage.flabbergastAnnotations.map((ann) => (
                        <Badge
                            key={ann.flabbergastId}
                            bg={ann.flabbergastKind === "if" ? "warning" : "info"}
                            className="me-1 mb-1"
                        >
                            [{ann.flabbergastKind}]
                            <input
                                className="ms-1 bg-transparent border-0 text-white"
                                value={ann.flabbergastDescription}
                                onChange={(e) =>
                                    flabbergastUpdateAnnotation(
                                        ann.flabbergastId,
                                        e.target.value,
                                    )
                                }
                                size={Math.max(10, ann.flabbergastDescription.length)}
                            />
                            <button
                                className="btn-close btn-close-white ms-1"
                                style={{ fontSize: "0.5rem" }}
                                onClick={() =>
                                    flabbergastDeleteAnnotation(ann.flabbergastId)
                                }
                            />
                        </Badge>
                    ))}
                    <Button
                        size="sm"
                        variant="warning"
                        className="me-1"
                        onClick={() => flabbergastAddAnnotation("if")}
                    >
                        + If
                    </Button>
                    <Button
                        size="sm"
                        variant="info"
                        onClick={() => flabbergastAddAnnotation("for")}
                    >
                        + For Loop
                    </Button>
                </Col>
            </Row>

            <Row>
                {/* Left: add component panel */}
                <Col md={2} className="border-end">
                    <p className="small fw-bold">Add Component</p>
                    <div className="d-flex flex-column gap-1">
                        {FLABBERGAST_COMPONENT_TYPES.map((t) => (
                            <Button
                                key={t}
                                size="sm"
                                variant="outline-primary"
                                onClick={() => flabbergastAddComponent(t)}
                            >
                                {t}
                            </Button>
                        ))}
                    </div>
                </Col>

                {/* Center: preview */}
                <Col md={7}>
                    <p className="small fw-bold">Preview</p>
                    <div
                        style={{
                            ...flabbergastPageStyle,
                            minHeight: 300,
                            border: "1px solid #dee2e6",
                            padding: flabbergastPageStyle.padding ?? "8px",
                        }}
                    >
                        {flabbergastCurrentPage.flabbergastComponents.map((comp) => (
                            <FlabbergastComponentPreview
                                key={comp.flabbergastId}
                                comp={comp}
                                selected={
                                    comp.flabbergastId === flabbergastSelectedId
                                }
                                onClick={() =>
                                    setFlabbergastSelectedId(comp.flabbergastId)
                                }
                            />
                        ))}
                    </div>

                    {/* Page style */}
                    <div className="mt-3">
                        <p className="small fw-bold mb-1">Page Style</p>
                        <Row className="g-1">
                            {(
                                [
                                    ["flabbergastBackgroundColor", "Background"],
                                    ["flabbergastDisplay", "Display"],
                                    ["flabbergastFlexDirection", "Flex Dir"],
                                    ["flabbergastJustifyContent", "Justify"],
                                    ["flabbergastAlignItems", "Align"],
                                    ["flabbergastGap", "Gap"],
                                ] as [keyof FlabbergastStyleConfig, string][]
                            ).map(([key, label]) => (
                                <Col xs={6} key={key}>
                                    <Form.Label className="small">{label}</Form.Label>
                                    <Form.Control
                                        size="sm"
                                        value={flabbergastCurrentPage.flabbergastPageStyle[key]}
                                        onChange={(e) =>
                                            flabbergastUpdatePage({
                                                ...flabbergastCurrentPage,
                                                flabbergastPageStyle: {
                                                    ...flabbergastCurrentPage.flabbergastPageStyle,
                                                    [key]: e.target.value,
                                                },
                                            })
                                        }
                                    />
                                </Col>
                            ))}
                        </Row>
                    </div>
                </Col>

                {/* Right: config */}
                <Col md={3}>
                    <p className="small fw-bold">Component Config</p>
                    {flabbergastSelectedComp ? (
                        <FlabbergastComponentConfig
                            comp={flabbergastSelectedComp}
                            routes={flabbergastRouteOptions}
                            onUpdate={flabbergastUpdateComponent}
                            onDelete={() =>
                                flabbergastDeleteComponent(
                                    flabbergastSelectedComp.flabbergastId,
                                )
                            }
                            onMoveUp={() =>
                                flabbergastMoveComponent(
                                    flabbergastSelectedComp.flabbergastId,
                                    -1,
                                )
                            }
                            onMoveDown={() =>
                                flabbergastMoveComponent(
                                    flabbergastSelectedComp.flabbergastId,
                                    1,
                                )
                            }
                        />
                    ) : (
                        <p className="text-muted small">
                            Click a component to configure it.
                        </p>
                    )}
                </Col>
            </Row>
        </Container>
    );
}

// End of file
