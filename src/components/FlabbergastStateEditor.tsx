import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Container,
    Breadcrumb,
    Button,
    Form,
    Table,
    Row,
    Col,
} from "react-bootstrap";
import {
    flabbergastLoadProjects,
    flabbergastSaveProjects,
} from "../utils/flabbergastStorage";
import type {
    FlabbergastProject,
    FlabbergastStateModel,
    FlabbergastStateAttribute,
    FlabbergastDataclass,
} from "../types";

const FLABBERGAST_ATTR_TYPES = [
    "str",
    "int",
    "float",
    "bool",
    "list[str]",
    "list[int]",
];

function flabbergastMakeId(): string {
    return Date.now().toString() + Math.random().toString(36).slice(2);
}

function flabbergastEmptyAttr(): FlabbergastStateAttribute {
    return {
        flabbergastId: flabbergastMakeId(),
        flabbergastName: "attr1",
        flabbergastType: "str",
        flabbergastDescription: "",
        flabbergastDefaultValue: '""',
    };
}

export function FlabbergastStateEditor() {
    const { id } = useParams<{ id: string }>();

    const [flabbergastProject, setFlabbergastProject] =
        useState<FlabbergastProject | null>(() => {
            const all = flabbergastLoadProjects();
            return all.find((p) => p.flabbergastId === id) ?? null;
        });

    if (!flabbergastProject) {
        return (
            <Container className="py-3">
                <p>Project not found.</p>
            </Container>
        );
    }

    function flabbergastPersistProject(updated: FlabbergastProject) {
        const all = flabbergastLoadProjects();
        const next = all.map((p) =>
            p.flabbergastId === updated.flabbergastId ? updated : p,
        );
        flabbergastSaveProjects(next);
        setFlabbergastProject(updated);
    }

    function flabbergastUpdateState(state: FlabbergastStateModel) {
        if (!flabbergastProject) return;
        flabbergastPersistProject({ ...flabbergastProject, flabbergastState: state });
    }

    const flabbergastState = flabbergastProject.flabbergastState;

    // --- State attributes helpers ---
    function flabbergastAddAttr() {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastAttributes: [
                ...flabbergastState.flabbergastAttributes,
                flabbergastEmptyAttr(),
            ],
        });
    }

    function flabbergastUpdateAttr(
        idx: number,
        field: keyof FlabbergastStateAttribute,
        val: string,
    ) {
        const attrs = flabbergastState.flabbergastAttributes.map((a, i) =>
            i === idx ? { ...a, [field]: val } : a,
        );
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastAttributes: attrs,
        });
    }

    function flabbergastDeleteAttr(idx: number) {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastAttributes: flabbergastState.flabbergastAttributes.filter(
                (_, i) => i !== idx,
            ),
        });
    }

    // --- Dataclass helpers ---
    function flabbergastAddDataclass() {
        const dc: FlabbergastDataclass = {
            flabbergastId: flabbergastMakeId(),
            flabbergastName: "MyClass",
            flabbergastAttributes: [],
        };
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastDataclasses: [
                ...flabbergastState.flabbergastDataclasses,
                dc,
            ],
        });
    }

    function flabbergastDeleteDataclass(dcId: string) {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastDataclasses: flabbergastState.flabbergastDataclasses.filter(
                (d) => d.flabbergastId !== dcId,
            ),
        });
    }

    function flabbergastUpdateDataclassName(dcId: string, name: string) {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastDataclasses: flabbergastState.flabbergastDataclasses.map(
                (d) =>
                    d.flabbergastId === dcId
                        ? { ...d, flabbergastName: name }
                        : d,
            ),
        });
    }

    function flabbergastAddDcAttr(dcId: string) {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastDataclasses: flabbergastState.flabbergastDataclasses.map(
                (d) =>
                    d.flabbergastId === dcId
                        ? {
                              ...d,
                              flabbergastAttributes: [
                                  ...d.flabbergastAttributes,
                                  flabbergastEmptyAttr(),
                              ],
                          }
                        : d,
            ),
        });
    }

    function flabbergastUpdateDcAttr(
        dcId: string,
        idx: number,
        field: keyof FlabbergastStateAttribute,
        val: string,
    ) {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastDataclasses: flabbergastState.flabbergastDataclasses.map(
                (d) =>
                    d.flabbergastId === dcId
                        ? {
                              ...d,
                              flabbergastAttributes: d.flabbergastAttributes.map(
                                  (a, i) =>
                                      i === idx ? { ...a, [field]: val } : a,
                              ),
                          }
                        : d,
            ),
        });
    }

    function flabbergastDeleteDcAttr(dcId: string, idx: number) {
        flabbergastUpdateState({
            ...flabbergastState,
            flabbergastDataclasses: flabbergastState.flabbergastDataclasses.map(
                (d) =>
                    d.flabbergastId === dcId
                        ? {
                              ...d,
                              flabbergastAttributes: d.flabbergastAttributes.filter(
                                  (_, i) => i !== idx,
                              ),
                          }
                        : d,
            ),
        });
    }

    return (
        <Container className="py-3">
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
                <Breadcrumb.Item active>State Editor</Breadcrumb.Item>
            </Breadcrumb>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Group>
                        <Form.Label>
                            <strong>State Class Name</strong>
                        </Form.Label>
                        <Form.Control
                            value={flabbergastState.flabbergastClassName}
                            onChange={(e) =>
                                flabbergastUpdateState({
                                    ...flabbergastState,
                                    flabbergastClassName: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                </Col>
            </Row>

            {flabbergastState.flabbergastAttributes.length < 4 && (
                <p className="text-warning small">
                    Warning: Your state class currently has{" "}
                    {flabbergastState.flabbergastAttributes.length} attribute
                    {flabbergastState.flabbergastAttributes.length === 1
                        ? ""
                        : "s"}
                    . At least 4 are required.
                </p>
            )}

            <h5>State Attributes</h5>
            <Table bordered size="sm" className="mb-2">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Default Value</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {flabbergastState.flabbergastAttributes.map((attr, idx) => (
                        <tr key={attr.flabbergastId}>
                            <td>
                                <Form.Control
                                    size="sm"
                                    value={attr.flabbergastName}
                                    onChange={(e) =>
                                        flabbergastUpdateAttr(
                                            idx,
                                            "flabbergastName",
                                            e.target.value,
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <Form.Select
                                    size="sm"
                                    value={attr.flabbergastType}
                                    onChange={(e) =>
                                        flabbergastUpdateAttr(
                                            idx,
                                            "flabbergastType",
                                            e.target.value,
                                        )
                                    }
                                >
                                    {FLABBERGAST_ATTR_TYPES.map((t) => (
                                        <option key={t}>{t}</option>
                                    ))}
                                </Form.Select>
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    value={attr.flabbergastDescription}
                                    onChange={(e) =>
                                        flabbergastUpdateAttr(
                                            idx,
                                            "flabbergastDescription",
                                            e.target.value,
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <Form.Control
                                    size="sm"
                                    value={attr.flabbergastDefaultValue}
                                    onChange={(e) =>
                                        flabbergastUpdateAttr(
                                            idx,
                                            "flabbergastDefaultValue",
                                            e.target.value,
                                        )
                                    }
                                />
                            </td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => flabbergastDeleteAttr(idx)}
                                >
                                    Del
                                </Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            <Button size="sm" onClick={flabbergastAddAttr} className="mb-4">
                + Add Attribute
            </Button>

            <h5>Dataclasses</h5>
            {flabbergastState.flabbergastDataclasses.map((dc) => (
                <div key={dc.flabbergastId} className="border rounded p-2 mb-3">
                    <Row className="align-items-center mb-2">
                        <Col xs="auto">
                            <Form.Label className="mb-0 fw-bold">
                                Class Name:
                            </Form.Label>
                        </Col>
                        <Col xs={4}>
                            <Form.Control
                                size="sm"
                                value={dc.flabbergastName}
                                onChange={(e) =>
                                    flabbergastUpdateDataclassName(
                                        dc.flabbergastId,
                                        e.target.value,
                                    )
                                }
                            />
                        </Col>
                        <Col xs="auto">
                            <Button
                                size="sm"
                                variant="danger"
                                onClick={() =>
                                    flabbergastDeleteDataclass(dc.flabbergastId)
                                }
                            >
                                Delete Class
                            </Button>
                        </Col>
                    </Row>
                    <Table bordered size="sm" className="mb-1">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Description</th>
                                <th>Default Value</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {dc.flabbergastAttributes.map((attr, idx) => (
                                <tr key={attr.flabbergastId}>
                                    <td>
                                        <Form.Control
                                            size="sm"
                                            value={attr.flabbergastName}
                                            onChange={(e) =>
                                                flabbergastUpdateDcAttr(
                                                    dc.flabbergastId,
                                                    idx,
                                                    "flabbergastName",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Form.Select
                                            size="sm"
                                            value={attr.flabbergastType}
                                            onChange={(e) =>
                                                flabbergastUpdateDcAttr(
                                                    dc.flabbergastId,
                                                    idx,
                                                    "flabbergastType",
                                                    e.target.value,
                                                )
                                            }
                                        >
                                            {FLABBERGAST_ATTR_TYPES.map((t) => (
                                                <option key={t}>{t}</option>
                                            ))}
                                        </Form.Select>
                                    </td>
                                    <td>
                                        <Form.Control
                                            size="sm"
                                            value={attr.flabbergastDescription}
                                            onChange={(e) =>
                                                flabbergastUpdateDcAttr(
                                                    dc.flabbergastId,
                                                    idx,
                                                    "flabbergastDescription",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Form.Control
                                            size="sm"
                                            value={attr.flabbergastDefaultValue}
                                            onChange={(e) =>
                                                flabbergastUpdateDcAttr(
                                                    dc.flabbergastId,
                                                    idx,
                                                    "flabbergastDefaultValue",
                                                    e.target.value,
                                                )
                                            }
                                        />
                                    </td>
                                    <td>
                                        <Button
                                            size="sm"
                                            variant="danger"
                                            onClick={() =>
                                                flabbergastDeleteDcAttr(
                                                    dc.flabbergastId,
                                                    idx,
                                                )
                                            }
                                        >
                                            Del
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>
                    <Button
                        size="sm"
                        onClick={() => flabbergastAddDcAttr(dc.flabbergastId)}
                    >
                        + Add Attribute
                    </Button>
                </div>
            ))}
            <Button
                variant="outline-primary"
                size="sm"
                onClick={flabbergastAddDataclass}
            >
                + Add Dataclass
            </Button>
        </Container>
    );
}
