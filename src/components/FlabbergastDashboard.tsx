import { useState } from "react";
import {
    Container,
    Button,
    Table,
    Modal,
    Form,
    Row,
    Col,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import {
    flabbergastLoadProjects,
    flabbergastSaveProjects,
} from "../utils/flabbergastStorage";
import { flabbergastCreateDefaultProject } from "../utils/flabbergastDefaults";
import {
    flabbergastGetTodoDemoProject,
    flabbergastGetBlogDemoProject,
} from "../utils/flabbergastDemoProjects";
import type { FlabbergastProject } from "../types";

export function FlabbergastDashboard() {
    const navigate = useNavigate();
    const [flabbergastProjects, setFlabbergastProjects] = useState<
        FlabbergastProject[]
    >(() => flabbergastLoadProjects());
    const [flabbergastShowModal, setFlabbergastShowModal] = useState(false);
    const [flabbergastNewName, setFlabbergastNewName] = useState("");

    function flabbergastHandleCreate() {
        if (!flabbergastNewName.trim()) return;
        const proj = flabbergastCreateDefaultProject(flabbergastNewName.trim());
        const updated = [...flabbergastProjects, proj];
        flabbergastSaveProjects(updated);
        setFlabbergastProjects(updated);
        setFlabbergastShowModal(false);
        setFlabbergastNewName("");
        void navigate(`/project/${proj.flabbergastId}`);
    }

    function flabbergastHandleDelete(id: string) {
        const updated = flabbergastProjects.filter(
            (p) => p.flabbergastId !== id,
        );
        flabbergastSaveProjects(updated);
        setFlabbergastProjects(updated);
    }

    function flabbergastLoadDemo(demo: FlabbergastProject) {
        const exists = flabbergastProjects.some(
            (p) => p.flabbergastId === demo.flabbergastId,
        );
        if (exists) return;
        const updated = [...flabbergastProjects, demo];
        flabbergastSaveProjects(updated);
        setFlabbergastProjects(updated);
    }

    return (
        <Container className="py-3">
            <h1>Drafter Designer</h1>
            <p className="text-muted">
                Design Drafter web app pages visually.
            </p>
            <Row className="mb-3">
                <Col>
                    <Button
                        variant="primary"
                        onClick={() => setFlabbergastShowModal(true)}
                    >
                        New Project
                    </Button>{" "}
                    <Button
                        variant="outline-secondary"
                        onClick={() =>
                            flabbergastLoadDemo(
                                flabbergastGetTodoDemoProject(),
                            )
                        }
                    >
                        Load Demo: Todo App
                    </Button>{" "}
                    <Button
                        variant="outline-secondary"
                        onClick={() =>
                            flabbergastLoadDemo(
                                flabbergastGetBlogDemoProject(),
                            )
                        }
                    >
                        Load Demo: Blog App
                    </Button>
                </Col>
            </Row>

            {flabbergastProjects.length === 0 ? (
                <p className="text-muted">
                    No projects yet. Create one or load a demo.
                </p>
            ) : (
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Last Modified</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {flabbergastProjects.map((proj) => (
                            <tr key={proj.flabbergastId}>
                                <td>{proj.flabbergastName}</td>
                                <td>{proj.flabbergastDescription}</td>
                                <td>
                                    {new Date(
                                        proj.flabbergastUpdatedAt,
                                    ).toLocaleDateString()}
                                </td>
                                <td>
                                    <Button
                                        size="sm"
                                        variant="primary"
                                        className="me-2"
                                        onClick={() =>
                                            void navigate(
                                                `/project/${proj.flabbergastId}`,
                                            )
                                        }
                                    >
                                        Open
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() =>
                                            flabbergastHandleDelete(
                                                proj.flabbergastId,
                                            )
                                        }
                                    >
                                        Delete
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal
                show={flabbergastShowModal}
                onHide={() => setFlabbergastShowModal(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>New Project</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group>
                            <Form.Label>Project Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={flabbergastNewName}
                                onChange={(e) =>
                                    setFlabbergastNewName(e.target.value)
                                }
                                onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                        flabbergastHandleCreate();
                                }}
                                placeholder="My App"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setFlabbergastShowModal(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="primary"
                        onClick={flabbergastHandleCreate}
                    >
                        Create
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}
