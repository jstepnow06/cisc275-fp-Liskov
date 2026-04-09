import type { FlabbergastProject, FlabbergastComponent } from "../types";

function flabbergastComponentToPython(comp: FlabbergastComponent): string {
    switch (comp.flabbergastType) {
        case "Text":
            return `Text(${JSON.stringify(comp.flabbergastContent)})`;
        case "TextBox":
            return `TextBox(${JSON.stringify(comp.flabbergastLabel)}, ${JSON.stringify(comp.flabbergastName)})`;
        case "TextArea":
            return `TextArea(${JSON.stringify(comp.flabbergastLabel)}, ${JSON.stringify(comp.flabbergastName)})`;
        case "CheckBox":
            return `CheckBox(${JSON.stringify(comp.flabbergastLabel)}, ${JSON.stringify(comp.flabbergastName)})`;
        case "SelectBox": {
            const opts = JSON.stringify(comp.flabbergastOptions);
            return `SelectBox(${JSON.stringify(comp.flabbergastLabel)}, ${JSON.stringify(comp.flabbergastName)}, ${opts})`;
        }
        case "Button":
            return `Button(${JSON.stringify(comp.flabbergastLabel)}, ${JSON.stringify(comp.flabbergastRoute)})`;
        case "Header": {
            const level = comp.flabbergastLevel >= 1 && comp.flabbergastLevel <= 6 ? comp.flabbergastLevel : 1;
            return `Header${level.toString()}(${JSON.stringify(comp.flabbergastContent)})`;
        }
    }
}

export function flabbergastGeneratePythonCode(
    project: FlabbergastProject,
): string {
    const lines: string[] = [];
    lines.push("from drafter import *");
    lines.push("from dataclasses import dataclass, field");
    lines.push("from typing import List");
    lines.push("");

    // Dataclasses
    for (const dc of project.flabbergastState.flabbergastDataclasses) {
        lines.push("@dataclass");
        lines.push(`class ${dc.flabbergastName}:`);
        if (dc.flabbergastAttributes.length === 0) {
            lines.push("    pass");
        } else {
            for (const attr of dc.flabbergastAttributes) {
                lines.push(
                    `    ${attr.flabbergastName}: ${attr.flabbergastType} = ${attr.flabbergastDefaultValue}`,
                );
            }
        }
        lines.push("");
    }

    // State class
    lines.push("@dataclass");
    lines.push(`class ${project.flabbergastState.flabbergastClassName}:`);
    if (project.flabbergastState.flabbergastAttributes.length === 0) {
        lines.push("    pass");
    } else {
        for (const attr of project.flabbergastState.flabbergastAttributes) {
            lines.push(
                `    ${attr.flabbergastName}: ${attr.flabbergastType} = ${attr.flabbergastDefaultValue}`,
            );
        }
    }
    lines.push("");

    const stateName = project.flabbergastState.flabbergastClassName;

    // Route functions
    for (const page of project.flabbergastPages) {
        lines.push("@route");
        lines.push(
            `def ${page.flabbergastName}(state: ${stateName}) -> Page:`,
        );
        if (page.flabbergastComponents.length === 0) {
            lines.push(`    return Page(state, [])`);
        } else {
            lines.push(`    return Page(state, [`);
            for (const comp of page.flabbergastComponents) {
                lines.push(
                    `        ${flabbergastComponentToPython(comp)},`,
                );
            }
            lines.push(`    ])`);
        }
        lines.push("");
    }

    // Start server
    const firstPage =
        project.flabbergastPages[0]?.flabbergastName ?? "index";
    lines.push(`start_server(${stateName}())`);
    lines.push(`# First page: ${firstPage}`);

    return lines.join("\n");
}
