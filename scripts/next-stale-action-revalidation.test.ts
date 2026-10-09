import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";

describe.each(["", "esm/"])("Next action/prerender isolation (%s)", (prefix) => {
  const readSource = (path: string) =>
    readFileSync(`node_modules/next/dist/${prefix}${path}.js`, "utf8");
  const template = readSource("build/templates/app-page-runtime");
  const condition = template.match(/const isRequestSpecificRender = ([^;]+);/)?.[1];
  const dispatch = template.match(/const result = (renderOperation === 'prerender'[^;]+);/)?.[1];
  if (!condition || !dispatch)
    throw new Error("Next render dispatch changed; review action isolation.");

  // Execute the installed framework expressions with spies at the route-module boundary.
  const isRequestRender = new Function(
    "forceStaticRender",
    "isDebugPrerender",
    "supportsDynamicResponse",
    "isPossibleServerAction",
    `return ${condition};`,
  ) as (forced: boolean, debug: boolean, dynamic: boolean, action: boolean) => boolean;
  const invoke = new Function(
    "renderOperation",
    "routeModule",
    "nextReq",
    "nextRes",
    "context",
    `return ${dispatch};`,
  ) as (operation: string, module: { render: () => void; prerender: () => void }) => void;

  it("does not re-execute the action while revalidating a stale shell", () => {
    const routeModule = { render: vi.fn(), prerender: vi.fn() };
    for (const forced of [false, true]) {
      invoke(isRequestRender(forced, false, true, true) ? "render" : "prerender", routeModule);
    }
    expect(routeModule.render).toHaveBeenCalledTimes(1);
    expect(routeModule.prerender).toHaveBeenCalledTimes(1);
  });

  it("uses prerender for background navigation revalidation and shell debugging", () => {
    expect(isRequestRender(true, false, true, false)).toBe(false);
    expect(isRequestRender(false, true, true, true)).toBe(false);
    expect(isRequestRender(false, false, true, false)).toBe(true);
  });

  it("keeps action handling out of the dedicated prerender implementation", () => {
    const source = readSource("server/app-render/app-render");
    const prerender = source.slice(
      source.indexOf("async function prerenderAppPage("),
      source.indexOf("async function renderAppPage("),
    );
    expect(prerender).toContain("prerenderToStreamWithTracing");
    expect(prerender).not.toContain("handleAction");
    expect(source.slice(source.indexOf("async function renderAppPage("))).toContain("handleAction");
    expect(readSource("server/route-modules/app-page/module")).toMatch(
      /prerender\(req, res, context\) \{\s+return [^;]*prerenderToHTMLOrFlight/,
    );
  });
});
