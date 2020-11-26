import { createMemoryRouter, getPathProps, useRoutes } from "./routes";
import { mountHook } from "./_testHelper"

describe("Helpers", () => {
    test("getPathProps", () => {
        const [regex, propNames] = getPathProps("/my/[test]/path.html");
        // @ts-ignore
        expect(regex.source).toBe(`\\/my\\/(.+?)\\/path.html`);
        expect(propNames).toMatchObject(["test"]);

        {
            const [regex, propNames] = getPathProps("/my/[foo]/path-[bar].html");
            // @ts-ignore
            expect(regex.source).toBe(`\\/my\\/(.+?)\\/path-(.+?).html`);
            expect(propNames).toMatchObject(["foo", "bar"]);
        }

        {
            const [regex, propNames] = getPathProps("/path/without/props");
            // @ts-ignore
            expect(regex).toBe("/path/without/props");
            expect(propNames).toMatchObject([]);
        }
    })
});


describe("useRoutes", () => {

    test("Resolves a route", () => {
        const routes = {
            "/": jest.fn(() => "root"),
            "/route1": jest.fn(() => "route1"),
            "/route2": () => "route2"
        };

        const router = createMemoryRouter();
        const { act, root } = mountHook(() => useRoutes(routes), router);
        expect(routes["/"]).toHaveBeenCalledTimes(1);
        expect(root.toJSON()).toBe("root");

        act(() => {
            router.navigate("/route1");
        });
        expect(routes["/"]).toHaveBeenCalledTimes(1);
        expect(routes["/route1"]).toHaveBeenCalledTimes(1);
        expect(root.toJSON()).toBe("route1");

        act(() => {
            router.navigate("/route1");
        });
        expect(routes["/"]).toHaveBeenCalledTimes(1);
        expect(routes["/route1"]).toHaveBeenCalledTimes(1);
        expect(root.toJSON()).toBe("route1");

        act(() => {
            router.navigate("/not-found");
        });
        expect(routes["/"]).toHaveBeenCalledTimes(1);
        expect(routes["/route1"]).toHaveBeenCalledTimes(1);
        expect(root.toJSON()).toBe(null);
    });

    it("Extracts parameters from a url", () => {
        let routeParams;

        const routes = {
            "/route/[slug]/id_[id].html": jest.fn((params) => routeParams = params)
        };

        const router = createMemoryRouter("/route/foo/id_bar.html");
        const { act, root } = mountHook(() => useRoutes(routes), router);
        expect(routes["/route/[slug]/id_[id].html"]).toHaveBeenCalled();
        expect(routeParams).toMatchObject({ slug: "foo", id: "bar" });
    });
});
