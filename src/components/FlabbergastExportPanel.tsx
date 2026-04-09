import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { Container, Breadcrumb, Button, Row, Col } from "react-bootstrap";
import { saveAs } from "file-saver";
import {
    flabbergastLoadProjects,
    flabbergastSaveProjects,
} from "../utils/flabbergastStorage";
import { flabbergastGeneratePythonCode } from "../utils/flabbergastCodeGen";
import { flabbergastExportDocx } from "../utils/flabbergastDocxExport";
import type { FlabbergastProject } from "../types";

export function FlabbergastExportPanel() {
    const { id } = useParams<{ id: string }>();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [flabbergastProject] = useState<FlabbergastProject | null>(() => {
        const all = flabbergastLoadProjects();
        return all.find((p) => p.flabbergastId === id) ?? null;
    });

    const [flabbergastPythonCode, setFlabbergastPythonCode] = useState<
        string | null
    >(null);

    if (!flabbergastProject) {
        return (
            <Container className="py-3">
                <p>Project not found.</p>
            </Container>
        );
    }

    function flabbergastHandleGenerate() {
        if (!flabbergastProject) return;
        setFlabbergastPythonCode(
            flabbergastGeneratePythonCode(flabbergastProject),
        );
    }

    function flabbergastHandleDownloadPy() {
        if (!flabbergastProject) return;
        const code = flabbergastGeneratePythonCode(flabbergastProject);
        saveAs(
            new Blob([code], { type: "text/plain" }),
            flabbergastProject.flabbergastName + ".py",
        );
    }

    function flabbergastHandleExportDocx() {
        if (!flabbergastProject) return;
        void flabbergastExportDocx(flabbergastProject);
    }

    function flabbergastHandleExportJson() {
        if (!flabbergastProject) return;
        saveAs(
            new Blob([JSON.stringify(flabbergastProject, null, 2)], {
                type: "application/json",
            }),
            flabbergastProject.flabbergastName + ".json",
        );
    }

    function flabbergastHandleImportJson(
        e: React.ChangeEvent<HTMLInputElement>,
    ) {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            const text = ev.target?.result;
            if (typeof text !== "string") return;
            try {
                const imported = JSON.parse(text) as FlabbergastProject;
                const all = flabbergastLoadProjects();
                const exists = all.some(
                    (p) => p.flabbergastId === imported.flabbergastId,
                );
                const updated = exists
                    ? all.map((p) =>
                          p.flabbergastId === imported.flabbergastId
                              ? imported
                              : p,
                      )
                    : [...all, imported];
                flabbergastSaveProjects(updated);
                window.location.href = `/project/${imported.flabbergastId}`;
            } catch {
                alert("Invalid JSON file.");
            }
        };
        reader.readAsText(file);
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
                <Breadcrumb.Item active>Export</Breadcrumb.Item>
            </Breadcrumb>

            <h4>Export — {flabbergastProject.flabbergastName}</h4>

            <Row className="g-2 mb-4">
                <Col xs="auto">
                    <Button onClick={flabbergastHandleGenerate}>
                        Generate Python Code
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="success"
                        onClick={flabbergastHandleDownloadPy}
                    >
                        Download Python (.py)
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="secondary"
                        onClick={flabbergastHandleExportDocx}
                    >
                        Export DOCX
                    </Button>
                </Col>
                <Col xs="auto">
                    <Button
                        variant="outline-primary"
                        onClick={flabbergastHandleExportJson}
                    >
                        Export JSON
                    </Button>
                </Col>
            </Row>

            <Row className="mb-3">
                <Col xs="auto">
                    <Button
                        variant="outline-secondary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Import JSON
                    </Button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        style={{ display: "none" }}
                        onChange={flabbergastHandleImportJson}
                    />
                </Col>
            </Row>

            {flabbergastPythonCode !== null && (
                <div>
                    <h6>Generated Python Code</h6>
                    <pre
                        style={{
                            background: "#1e1e1e",
                            color: "#d4d4d4",
                            padding: "16px",
                            borderRadius: "4px",
                            overflow: "auto",
                            maxHeight: 500,
                        }}
                    >
                        {flabbergastPythonCode}
                    </pre>
                </div>
            )}
        </Container>
    );
}
