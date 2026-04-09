import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    Background,
    Controls,
    ReactFlowProvider,
} from "@xyflow/react";
import type {
    Node,
    Edge,
    Connection,
} from "@xyflow/react";
import { Container, Button, Modal, Form, Row, Col } from "react-bootstrap";
import {
    flabbergastLoadProjects,
    flabbergastSaveProjects,
} from "../utils/flabbergastStorage";
import { flabbergastCreateDefaultPage, flabbergastCreateDefaultRoute } from "../utils/flabbergastDefaults";
import type { FlabbergastProject } from "../types";

// Node data extends a plain record so @xyflow/react is satisfied
interface FlabbergastNodeData extends Record<string, string | number | boolean> {
    label: string;
    pageId: string;
}
type FlabbergastFlowNode = Node<FlabbergastNodeData>;
type FlabbergastFlowEdge = Edge<{ label: string; routeId: string; [key: string]: string }>;

function flabbergastBuildNodes(project: FlabbergastProject): FlabbergastFlowNode[] {
    return project.flabbergastPages.map((page) => ({
        id: page.flabbergastId,
        position: { x: page.flabbergastX, y: page.flabbergastY },
        data: { label: page.flabbergastName, pageId: page.flabbergastId },
    }));
}

function flabbergastBuildEdges(project: FlabbergastProject): FlabbergastFlowEdge[] {
    return project.flabbergastRoutes.map((route) => ({
        id: route.flabbergastId,
        source: route.flabbergastSourcePageId,
        target: route.flabbergastTargetPageId,
        label: route.flabbergastName,
        data: { label: route.flabbergastName, routeId: route.flabbergastId },
    }));
}

function FlabbergastGraphInner({ projectId }: { projectId: string }) {
    const navigate = useNavigate();

    const [flabbergastProject, setFlabbergastProject] =
        useState<FlabbergastProject | null>(() => {
            const all = flabbergastLoadProjects();
            return all.find((p) => p.flabbergastId === projectId) ?? null;
        });

    const [nodes, setNodes, onNodesChange] = useNodesState<FlabbergastFlowNode>(
        flabbergastProject ? flabbergastBuildNodes(flabbergastProject) : [],
    );
    const [edges, setEdges, onEdgesChange] = useEdgesState<FlabbergastFlowEdge>(
        flabbergastProject ? flabbergastBuildEdges(flabbergastProject) : [],
    );

    const [flabbergastShowAddPage, setFlabbergastShowAddPage] = useState(false);
    const [flabbergastNewPageName, setFlabbergastNewPageName] = useState("");

    const [flabbergastRouteFrom, setFlabbergastRouteFrom] = useState("");
    const [flabbergastRouteTo, setFlabbergastRouteTo] = useState("");
    const [flabbergastRouteName, setFlabbergastRouteName] = useState("");

    function flabbergastPersist(updated: FlabbergastProject) {
        const all = flabbergastLoadProjects();
        const next = all.map((p) =>
            p.flabbergastId === updated.flabbergastId ? updated : p,
        );
        flabbergastSaveProjects(next);
        setFlabbergastProject(updated);
    }

    const flabbergastHandleConnect = useCallback(
        (connection: Connection) => {
            setEdges((eds) => addEdge(connection, eds));
        },
        [setEdges],
    );

    const flabbergastHandleDragStop = useCallback(
        (_event: React.MouseEvent, node: FlabbergastFlowNode) => {
            if (!flabbergastProject) return;
            const updatedPages = flabbergastProject.flabbergastPages.map((p) =>
                p.flabbergastId === node.id
                    ? { ...p, flabbergastX: node.position.x, flabbergastY: node.position.y }
                    : p,
            );
            flabbergastPersist({
                ...flabbergastProject,
                flabbergastPages: updatedPages,
            });
        },
        [flabbergastProject],
    );

    function flabbergastHandleAddPage() {
        if (!flabbergastNewPageName.trim() || !flabbergastProject) return;
        const page = flabbergastCreateDefaultPage(flabbergastNewPageName.trim());
        const updatedProject: FlabbergastProject = {
            ...flabbergastProject,
            flabbergastPages: [...flabbergastProject.flabbergastPages, page],
        };
        flabbergastPersist(updatedProject);
        const newNode: FlabbergastFlowNode = {
            id: page.flabbergastId,
            position: { x: page.flabbergastX, y: page.flabbergastY },
            data: { label: page.flabbergastName, pageId: page.flabbergastId },
        };
        setNodes((ns) => [...ns, newNode]);
        setFlabbergastShowAddPage(false);
        setFlabbergastNewPageName("");
    }

    function flabbergastHandleAddRoute() {
        if (
            !flabbergastRouteName.trim() ||
            !flabbergastRouteFrom ||
            !flabbergastRouteTo ||
            !flabbergastProject
        )
            return;
        const route = flabbergastCreateDefaultRoute(
            flabbergastRouteName.trim(),
            flabbergastRouteFrom,
            flabbergastRouteTo,
        );
        const updatedProject: FlabbergastProject = {
            ...flabbergastProject,
            flabbergastRoutes: [...flabbergastProject.flabbergastRoutes, route],
        };
        flabbergastPersist(updatedProject);
        const newEdge: FlabbergastFlowEdge = {
            id: route.flabbergastId,
            source: route.flabbergastSourcePageId,
            target: route.flabbergastTargetPageId,
            label: route.flabbergastName,
            data: { label: route.flabbergastName, routeId: route.flabbergastId },
        };
        setEdges((es) => [...es, newEdge]);
        setFlabbergastRouteName("");
    }

    function flabbergastHandleDeletePage(pageId: string) {
        if (!flabbergastProject) return;
        const updatedProject: FlabbergastProject = {
            ...flabbergastProject,
            flabbergastPages: flabbergastProject.flabbergastPages.filter(
                (p) => p.flabbergastId !== pageId,
            ),
            flabbergastRoutes: flabbergastProject.flabbergastRoutes.filter(
                (r) =>
                    r.flabbergastSourcePageId !== pageId &&
                    r.flabbergastTargetPageId !== pageId,
            ),
        };
        flabbergastPersist(updatedProject);
        setNodes((ns) => ns.filter((n) => n.id !== pageId));
        setEdges((es) =>
            es.filter(
                (e) => e.source !== pageId && e.target !== pageId,
            ),
        );
    }

    if (!flabbergastProject) {
        return (
            <Container className="py-3">
                <p>Project not found.</p>
            </Container>
        );
    }

    return (
        <Container fluid className="py-3">
            <Row className="mb-2 align-items-center">
                <Col>
                    <Link to={`/project/${projectId}`} className="me-3">
                        ← Back
                    </Link>
                    <strong>{flabbergastProject.flabbergastName}</strong> — Page
                    Graph
                </Col>
                <Col xs="auto">
                    <Button
                        size="sm"
                        onClick={() => setFlabbergastShowAddPage(true)}
                    >
                        Add Page
                    </Button>
                </Col>
            </Row>

            <Row className="mb-2 g-2 align-items-end">
                <Col xs="auto">
                    <Form.Select
                        size="sm"
                        value={flabbergastRouteFrom}
                        onChange={(e) =>
                            setFlabbergastRouteFrom(e.target.value)
                        }
                    >
                        <option value="">From page…</option>
                        {flabbergastProject.flabbergastPages.map((p) => (
                            <option key={p.flabbergastId} value={p.flabbergastId}>
                                {p.flabbergastName}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <Form.Select
                        size="sm"
                        value={flabbergastRouteTo}
                        onChange={(e) => setFlabbergastRouteTo(e.target.value)}
                    >
                        <option value="">To page…</option>
                        {flabbergastProject.flabbergastPages.map((p) => (
                            <option key={p.flabbergastId} value={p.flabbergastId}>
                                {p.flabbergastName}
                            </option>
                        ))}
                    </Form.Select>
                </Col>
                <Col xs="auto">
                    <Form.Control
                        size="sm"
                        placeholder="Route name"
                        value={flabbergastRouteName}
                        onChange={(e) =>
                            setFlabbergastRouteName(e.target.value)
                        }
                    />
                </Col>
                <Col xs="auto">
                    <Button size="sm" onClick={flabbergastHandleAddRoute}>
                        Add Route
                    </Button>
                </Col>
            </Row>

            <div style={{ height: 500, border: "1px solid #ccc" }}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={flabbergastHandleConnect}
                    onNodeDragStop={flabbergastHandleDragStop}
                    onNodeClick={(_event, node) => {
                        void navigate(
                            `/project/${projectId}/page/${node.data.pageId}`,
                        );
                    }}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>
            </div>

            <h6 className="mt-3">Pages</h6>
            <Row className="g-2">
                {flabbergastProject.flabbergastPages.map((page) => (
                    <Col xs="auto" key={page.flabbergastId}>
                        <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() =>
                                flabbergastHandleDeletePage(page.flabbergastId)
                            }
                        >
                            Delete "{page.flabbergastName}"
                        </Button>
                    </Col>
                ))}
            </Row>

            <Modal
                show={flabbergastShowAddPage}
                onHide={() => setFlabbergastShowAddPage(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Add Page</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form.Control
                        placeholder="Page name (e.g. about)"
                        value={flabbergastNewPageName}
                        onChange={(e) =>
                            setFlabbergastNewPageName(e.target.value)
                        }
                        onKeyDown={(e) => {
                            if (e.key === "Enter") flabbergastHandleAddPage();
                        }}
                    />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setFlabbergastShowAddPage(false)}
                    >
                        Cancel
                    </Button>
                    <Button onClick={flabbergastHandleAddPage}>Add</Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export function FlabbergastPageGraph() {
    const { id } = useParams<{ id: string }>();
    return (
        <ReactFlowProvider>
            <FlabbergastGraphInner projectId={id ?? ""} />
        </ReactFlowProvider>
    );
}
