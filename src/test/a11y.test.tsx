import { describe, it, expect } from "vitest";
import { render, act } from "@testing-library/react";
import { axe } from "vitest-axe";
import { createRouter, createRootRoute, createRoute, RouterProvider } from "@tanstack/react-router";
import { Footer } from "../components/Footer";
import { CookieNotice } from "../components/CookieNotice";
import { LegalLayout } from "../components/LegalLayout";

// Helper to provide TanStack Router context to components that use <Link>
function renderWithRouter(Component: () => React.ReactElement) {
  const rootRoute = createRootRoute({
    component: Component,
  });
  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Component,
  });
  const privacyRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/privacy",
    component: () => <div />,
  });
  const termsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/terms",
    component: () => <div />,
  });
  const cookiesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/cookies",
    component: () => <div />,
  });

  const router = createRouter({
    routeTree: rootRoute.addChildren([indexRoute, privacyRoute, termsRoute, cookiesRoute]),
  });

  let renderResult: ReturnType<typeof render>;
  act(() => {
    renderResult = render(<RouterProvider router={router} />);
  });
  return renderResult!;
}

describe("Accessibility (axe WCAG 2.2 audit)", () => {
  it("Footer component should have 0 axe accessibility violations", async () => {
    const { container } = renderWithRouter(() => <Footer />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("CookieNotice component should have 0 axe accessibility violations", async () => {
    localStorage.removeItem("cookie_notice_acknowledged");
    const { container } = renderWithRouter(() => <CookieNotice />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it("LegalLayout component should have 0 axe accessibility violations", async () => {
    const { container } = renderWithRouter(() => (
      <LegalLayout
        title="Test Legal Policy"
        version="1.0.0"
        lastUpdated="October 22, 2026"
      >
        <section>
          <h2>Test Heading</h2>
          <p>Test content paragraph for accessibility checking.</p>
        </section>
      </LegalLayout>
    ));
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
