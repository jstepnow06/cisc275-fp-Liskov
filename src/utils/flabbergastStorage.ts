import type { FlabbergastProject } from "../types";

const FLABBERGAST_PROJECTS_KEY = "flabbergast_projects";
const FLABBERGAST_CURRENT_KEY = "flabbergast_current_id";

export function flabbergastSaveProjects(projects: FlabbergastProject[]): void {
    localStorage.setItem(FLABBERGAST_PROJECTS_KEY, JSON.stringify(projects));
}

export function flabbergastLoadProjects(): FlabbergastProject[] {
    const raw = localStorage.getItem(FLABBERGAST_PROJECTS_KEY);
    if (raw === null) return [];
    try {
        return JSON.parse(raw) as FlabbergastProject[];
    } catch {
        return [];
    }
}

export function flabbergastSaveCurrentProjectId(id: string): void {
    localStorage.setItem(FLABBERGAST_CURRENT_KEY, id);
}

export function flabbergastLoadCurrentProjectId(): string | null {
    return localStorage.getItem(FLABBERGAST_CURRENT_KEY);
}
