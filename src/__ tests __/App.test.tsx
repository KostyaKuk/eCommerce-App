import { render } from "@testing-library/react";
import App from "../App";
import { MemoryRouter } from "react-router-dom";

test("demo", () => {
  expect(true).toBe(true);
});

test("Renders the main page", () => {
  render(
    <MemoryRouter>
      <App />
    </MemoryRouter>
  );
  expect(true).toBeTruthy();
});
