import React, { Fragment } from "react";
import { Switch, Route } from "wouter";

const PRESERVED = import.meta.globEager("/src/pages/(_app|404).jsx");
const ROUTES = import.meta.globEager("/src/pages/**/[a-z[]*.jsx");

const preserved = Object.keys(PRESERVED).reduce((preserved, file) => {
  const key = file.replace(/\/src\/pages\/|\.jsx$/g, "");
  return { ...preserved, [key]: PRESERVED[file].default };
}, {});

const convertToOrderNumber = (path) =>
  path === "/src/pages/index.jsx"
    ? 1
    : /index.jsx/.test(path)
    ? 2
    : !/\[(.+)\]/.test(path)
    ? 3
    : !/\[\.{3}.+\]/.test(path)
    ? 4
    : 5;

const removeTrailingForwardSlash = (path) =>
  path.length > 1 && path[path.length - 1] === "/" ? path.substring(0, path.length - 1) : path;

const routes = Object.keys(ROUTES)
  .sort((pathA, pathB) => convertToOrderNumber(pathA) - convertToOrderNumber(pathB))
  .map((route) => {
    const path = route
      .replace(/\/src\/pages|index|\.jsx$/g, "")
      .replace(/\[\.{3}(.+)\]/, ":$1*")
      .replace(/\[(.+)\]/, ":$1");

    return { path: removeTrailingForwardSlash(path), component: ROUTES[route].default };
  });

/*

* new order

[
  { path: "/" },
  { path: "/posts" },
  { path: "/posts/topic" },
  { path: "/settings/profile" },
  { path: "/:user/settings" },
  { path: "/posts/:slug" },
  { path: "/posts/:all*" },
]

* prior order

[
  { path: "/" },
  { path: "/posts" },
  { path: "/posts/topic" },
  { path: "/posts/:slug" },
  { path: "/posts/:rest*" },
  { path: "/settings/profile" },
  { path: "/:user/settings" },
]

*/

const Routes = () => {
  const App = preserved?.["_app"] || Fragment;
  const NotFound = preserved?.["404"] || Fragment;

  return (
    <App
      routes={
        <Switch>
          {routes.map(({ component: Component = Fragment, path }) => (
            <Route path={path} key={path}>
              {(params) => <Component {...params} />}
            </Route>
          ))}
          <Route>{(params) => <NotFound {...params} />}</Route>
        </Switch>
      }
    ></App>
  );
};

export default Routes;
