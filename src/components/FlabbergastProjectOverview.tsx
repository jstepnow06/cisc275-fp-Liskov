import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    Container,
    Breadcrumb,
    Button,
    Form,
    ListGroup,
    Row,
    Col,
} from "react-bootstrap";
import {
    flabbergastLoadProjects,
    flabbergastSaveProjects,
} from "../utils/flabbergastStorage";
import type { FlabbergastProject } from "../types";

function flabbergastFindProject(
    id: string,
): FlabbergastProject | undefined {
    return flabbergastLoadProjects().find((p) => p.flabbergastId === id);
}

function flabbergastPersist(project: FlabbergastProject): void {
    const all = flabbergastLoadProjects();
    const updated = all.map((p) =>
        p.flabbergastId === project.flabbergastId ? project : p,
    );
    flabbergastSaveProjects(updated);
}

export function FlabbergastProjectOverview() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [flabbergastProject, setFlabbergastProject] =
        useState<FlabbergastProject | null>(
            () => flabbergastFindProject(id ?? "") ?? null,
        );

    if (!flabbergastProject) {
        return (
            <Container className="py-3">
                <p>Project not found.</p>
                <Button onClick={() => void navigate("/")}>
                    Back to Dashboard
                </Button>
            </Container>
        );
    }

    function flabbergastUpdate(updated: FlabbergastProject) {
        const stamped: FlabbergastProject = {
            ...updated,
            flabbergastUpdatedAt: new Date().toISOString(),
        };
        flabbergastPersist(stamped);
        setFlabbergastProject(stamped);
    }

    return (
        <Container className="py-3">
            <Breadcrumb>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Dashboard
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    {flabbergastProject.flabbergastName}
                </Breadcrumb.Item>
            </Breadcrumb>

            <Row className="mb-3">
                <Col md={8}>
                    <Form.Group className="mb-2">
                        <Form.Label>
                            <strong>Project Name</strong>
                        </Form.Label>
                        <Form.Control
                            type="text"
                            value={flabbergastProject.flabbergastName}
                            onChange={(e) =>
                                flabbergastUpdate({
                                    ...flabbergastProject,
                                    flabbergastName: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={2}
                            value={flabbergastProject.flabbergastDescription}
                            onChange={(e) =>
                                flabbergastUpdate({
                                    ...flabbergastProject,
                                    flabbergastDescription: e.target.value,
                                })
                            }
                        />
                    </Form.Group>
                </Col>
                <Col md={4} className="d-flex flex-column gap-2 pt-4">
                    <Button
                        variant="outline-primary"
                        onClick={() =>
                            void navigate(
                                `/project/${flabbergastProject.flabbergastId}/graph`,
                            )
                        }
                    >
                        Page Graph
                    </Button>
                    <Button
                        variant="outline-secondary"
                        onClick={() =>
                            void navigate(
                                `/project/${flabbergastProject.flabbergastId}/state`,
                            )
                        }
                    >
                        State Editor
                    </Button>
                    <Button
                        variant="outline-success"
                        onClick={() =>
                            void navigate(
                                `/project/${flabbergastProject.flabbergastId}/export`,
                            )
                        }
                    >
                        Export
                    </Button>
                </Col>
            </Row>

            <h5>Pages</h5>
            <ListGroup className="mb-3">
                {flabbergastProject.flabbergastPages.map((page) => (
                    <ListGroup.Item
                        key={page.flabbergastId}
                        action
                        as={Link}
                        to={`/project/${flabbergastProject.flabbergastId}/page/${page.flabbergastId}`}
                    >
                        {page.flabbergastName}
                        {page.flabbergastDescription && (
                            <span className="text-muted ms-2 small">
                                — {page.flabbergastDescription}
                            </span>
                        )}
                    </ListGroup.Item>
                ))}
            </ListGroup>
        </Container>
    );
}
