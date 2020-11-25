import { createMemoryRouter, useRoutes } from "./routes";
import { mountHook } from "./_testHelper"

describe("useRoutes", () => {

    test("Resolves a route", () => {
        const routes = {
            "/": jest.fn(() => "root"),
            "/route1": jest.fn(() => "route1"),
            "/route2": () => "route2"
        };

        const router = createMemoryRouter();
        const {act, root} = mountHook(() => useRoutes(routes), router);
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
});
