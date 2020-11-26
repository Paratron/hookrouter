import React from "react";
import { RouterProvider, createMemoryRouter, findRoute, getPathProps, prepareRoutes, useRoutes } from "./routes";
import { mountHook } from "./_testHelper"
import TestRenderer from "react-test-renderer";

describe("Helpers", () => {
    const routes = {
        "/a/static/route": () => "a",
        "/with/[slug]/": (props: any) => props,
        "/more/[complicated]/stuff-[here].html": (props: any) => props
    };

    test("findRoute", () => {
        const prepared = prepareRoutes(routes);
        expect(findRoute(prepared, "/a/static/route")).toBe("a");
        expect(findRoute(prepared, "/with/test/")).toMatchObject({slug: "test"});
        expect(findRoute(prepared, "/more/test/stuff-1gfd1212.html")).toMatchObject({complicated: "test", here: "1gfd1212"});
    });

    test("prepareRoutes", () => {
        const prepared = prepareRoutes(routes);

        expect(prepared.length).toBe(3);
        expect(prepared[0][0]).toBe(Object.keys(routes)[0]);
        expect(prepared[0][1].length).toBe(0);

        // @ts-ignore
        expect(prepared[1][0].source).toBe(/^\/with\/(.+?)\/$/.source);
        expect(prepared[1][1]).toMatchObject(["slug"]);

        //@ts-ignore
        expect(prepared[2][0].source).toBe(/^\/more\/(.+?)\/stuff-(.+?)\.html$/.source);
        expect(prepared[2][1]).toMatchObject(["complicated", "here"]);
    });

    test("getPathProps", () => {
        const [regex, propNames] = getPathProps("/my/[test]/path.html");
        // @ts-ignore
        expect(regex.source).toBe(/^\/my\/(.+?)\/path\.html$/.source);
        expect(propNames).toMatchObject(["test"]);

        {
            const [regex, propNames] = getPathProps("/my/[foo]/path-[bar].html");
            // @ts-ignore
            expect(regex.source).toBe(/^\/my\/(.+?)\/path-(.+?)\.html$/.source);
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
        let routeParams = null;

        const routes = {
            "/route/[slug]/id_[id].html": jest.fn((params) => {routeParams = params; return null;})
        };

        const router = createMemoryRouter("/route/products/id_12512.html");
        const { act } = mountHook(() => useRoutes(routes), router);
        expect(routes["/route/[slug]/id_[id].html"]).toHaveBeenCalled();
        expect(routeParams).toMatchObject({ slug: "products", id: "12512" });

        act(() => {
            router.navigate("/route/foo/id_bar.html")
        });
        expect(routes["/route/[slug]/id_[id].html"]).toHaveBeenCalledTimes(2);
        expect(routeParams).toMatchObject({ slug: "foo", id: "bar" });
    });

    it("Can handle nested routes", () => {
        const router = createMemoryRouter("/");

        const parentRoutes = {
            "/": () => <Landing />,
            "/category/[category]*": ({category}: {category: string}) => <Category id={category} />
        };

        const childRoutes = {
            "/": () => (category: string) => `Welcome to ${category}`
        };

        const App = () => {
            const result = useRoutes(parentRoutes);
            return <div>{result || "Root broken"}</div>;
        };

        const Landing = () => {
            return <a href="/category/trashware/">Show Category</a>;
        };

        const Category = ({id}: {id: string}) => {
            const result = useRoutes(childRoutes);

            return <div>{result ? result(id) : "Not found"}</div>;
        };

        const renderer = TestRenderer.create((
            <RouterProvider router={router}>
                <App />
            </RouterProvider>
        ));

        const instance = renderer.root;

        expect(instance.findByProps({href: "/category/trashware/"}).children).toEqual(['Show Category']);

        TestRenderer.act(() => {
            router.navigate("/category/trashware/");
        });

        expect(instance.findByType(Category).children).toEqual(["Welcome to trashware"]);

        console.log(renderer.toJSON());
    });
});
