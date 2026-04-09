import { render, screen } from "@testing-library/react";
import { App } from "../src/App";

test("App component displays dashboard heading", () => {
    render(<App />);
    const heading = screen.getByRole("heading", { name: /Drafter Designer/i });
    expect(heading).toBeInTheDocument();
});
