import "bootstrap/dist/css/bootstrap.min.css";
import "@xyflow/react/dist/style.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Container, Navbar, Nav } from "react-bootstrap";
import { FlabbergastDashboard } from "./components/FlabbergastDashboard";
import { FlabbergastProjectOverview } from "./components/FlabbergastProjectOverview";
import { FlabbergastPageGraph } from "./components/FlabbergastPageGraph";
import { FlabbergastPageEditor } from "./components/FlabbergastPageEditor";
import { FlabbergastStateEditor } from "./components/FlabbergastStateEditor";
import { FlabbergastExportPanel } from "./components/FlabbergastExportPanel";

export function App() {
    return (
        <BrowserRouter>
            <Navbar bg="dark" variant="dark" className="mb-3">
                <Container>
                    <Navbar.Brand as={Link} to="/">
                        Drafter Designer
                    </Navbar.Brand>
                    <Nav>
                        <Nav.Link as={Link} to="/">
                            Dashboard
                        </Nav.Link>
                    </Nav>
                </Container>
            </Navbar>
            <Container fluid>
                <Routes>
                    <Route path="/" element={<FlabbergastDashboard />} />
                    <Route
                        path="/project/:id"
                        element={<FlabbergastProjectOverview />}
                    />
                    <Route
                        path="/project/:id/graph"
                        element={<FlabbergastPageGraph />}
                    />
                    <Route
                        path="/project/:id/page/:pageId"
                        element={<FlabbergastPageEditor />}
                    />
                    <Route
                        path="/project/:id/state"
                        element={<FlabbergastStateEditor />}
                    />
                    <Route
                        path="/project/:id/export"
                        element={<FlabbergastExportPanel />}
                    />
                </Routes>
            </Container>
        </BrowserRouter>
    );
}

export default App;
