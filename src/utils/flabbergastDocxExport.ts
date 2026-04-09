import { Document, Paragraph, TextRun, HeadingLevel, Packer } from "docx";
import { saveAs } from "file-saver";
import type { FlabbergastProject } from "../types";

export async function flabbergastExportDocx(
    project: FlabbergastProject,
): Promise<void> {
    const children: Paragraph[] = [];

    children.push(
        new Paragraph({
            text: "Project: " + project.flabbergastName,
            heading: HeadingLevel.HEADING_1,
        }),
    );

    if (project.flabbergastDescription) {
        children.push(
            new Paragraph({
                children: [new TextRun(project.flabbergastDescription)],
            }),
        );
    }

    // Pages section
    children.push(
        new Paragraph({
            text: "Pages",
            heading: HeadingLevel.HEADING_2,
        }),
    );

    for (const page of project.flabbergastPages) {
        children.push(
            new Paragraph({
                text: page.flabbergastName,
                heading: HeadingLevel.HEADING_3,
            }),
        );
        if (page.flabbergastDescription) {
            children.push(
                new Paragraph({
                    children: [new TextRun(page.flabbergastDescription)],
                }),
            );
        }
        if (page.flabbergastComponents.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Components:",
                            bold: true,
                        }),
                    ],
                }),
            );
            for (const comp of page.flabbergastComponents) {
                children.push(
                    new Paragraph({
                        text: `  [${comp.flabbergastType}] ${comp.flabbergastLabel}`,
                    }),
                );
            }
        }
        if (page.flabbergastAnnotations.length > 0) {
            children.push(
                new Paragraph({
                    children: [
                        new TextRun({
                            text: "Annotations:",
                            bold: true,
                        }),
                    ],
                }),
            );
            for (const ann of page.flabbergastAnnotations) {
                children.push(
                    new Paragraph({
                        text: `  [${ann.flabbergastKind}] ${ann.flabbergastDescription}`,
                    }),
                );
            }
        }
    }

    // Routes section
    children.push(
        new Paragraph({
            text: "Routes",
            heading: HeadingLevel.HEADING_2,
        }),
    );

    for (const route of project.flabbergastRoutes) {
        const srcPage = project.flabbergastPages.find(
            (p) => p.flabbergastId === route.flabbergastSourcePageId,
        );
        const tgtPage = project.flabbergastPages.find(
            (p) => p.flabbergastId === route.flabbergastTargetPageId,
        );
        const srcName = srcPage?.flabbergastName ?? route.flabbergastSourcePageId;
        const tgtName = tgtPage?.flabbergastName ?? route.flabbergastTargetPageId;
        children.push(
            new Paragraph({
                text: `${route.flabbergastName}: ${srcName} -> ${tgtName}`,
            }),
        );
        if (route.flabbergastDescription) {
            children.push(
                new Paragraph({
                    text: `  ${route.flabbergastDescription}`,
                }),
            );
        }
    }

    // State section
    children.push(
        new Paragraph({
            text: "State Model",
            heading: HeadingLevel.HEADING_2,
        }),
    );

    children.push(
        new Paragraph({
            children: [
                new TextRun({
                    text: `Class: ${project.flabbergastState.flabbergastClassName}`,
                    bold: true,
                }),
            ],
        }),
    );

    for (const attr of project.flabbergastState.flabbergastAttributes) {
        children.push(
            new Paragraph({
                text: `  ${attr.flabbergastName}: ${attr.flabbergastType} = ${attr.flabbergastDefaultValue}`,
            }),
        );
    }

    for (const dc of project.flabbergastState.flabbergastDataclasses) {
        children.push(
            new Paragraph({
                text: `Dataclass: ${dc.flabbergastName}`,
                heading: HeadingLevel.HEADING_3,
            }),
        );
        for (const attr of dc.flabbergastAttributes) {
            children.push(
                new Paragraph({
                    text: `  ${attr.flabbergastName}: ${attr.flabbergastType} = ${attr.flabbergastDefaultValue}`,
                }),
            );
        }
    }

    const doc = new Document({
        sections: [
            {
                children,
            },
        ],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, project.flabbergastName + ".docx");
}
