import React, { useState } from "react";
import Home from "./pages/Home";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Signin from "./pages/Signin";
import Dashboard from "./pages/Dashboard";
import Loader from "./components/Loader";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Products from "./pages/Products";
import Admins from "./pages/Admins";
import Customers from "./pages/Customers";
import Settings from "./pages/Settings";
import { RedirectAuth, RequireAuth } from "./components/ProtectedRouter";
import Orders from "./pages/Orders";

const App = () => {
  const NavBarRoutes = ["/", "/signup", "/signin"];
  const ConditionalNavBar = () => {
    const location = useLocation();
    const showNavBar = !NavBarRoutes.includes(location.pathname);

    return showNavBar ? <Navbar /> : null;
  };
  const [loader, setLoader] = useState(false);

  const makeItSpin = (spinvalue) => {
    setLoader(spinvalue);
  };
  return (
    <BrowserRouter>
      <div className="flex ">
        <div className="flex">
          <ConditionalNavBar />
        </div>
        <div className="flex-1 overflow-y-auto h-screen">
          <Routes>
            <Route
              path="/"
              element={
                <RedirectAuth>
                  <Signin makeItSpin={makeItSpin} />
                </RedirectAuth>
              }
            />
            <Route
              path="/signin"
              element={
                <RedirectAuth>
                  <Signin makeItSpin={makeItSpin} />
                </RedirectAuth>
              }
            />

            <Route
              path="/products"
              element={
                <RequireAuth>
                  <Products makeItSpin={makeItSpin} />{" "}
                </RequireAuth>
              }
            />
            <Route
              path="/customers"
              element={
                <RequireAuth>
                  <Customers makeItSpin={makeItSpin} />
                </RequireAuth>
              }
            />
            <Route
              path="/admins"
              element={
                <RequireAuth>
                  <Admins makeItSpin={makeItSpin} />{" "}
                </RequireAuth>
              }
            />
            <Route
              path="/settings"
              element={
                <RequireAuth>
                  <Settings makeItSpin={makeItSpin} />{" "}
                </RequireAuth>
              }
            />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <Orders makeItSpin={makeItSpin} />{" "}
                </RequireAuth>
              }
            />
          </Routes>
        </div>
        <div></div>
      </div>
      <Loader spinning={loader} />

      <ToastContainer limit={4} newestOnTop={true} />
    </BrowserRouter>
  );
};

export default App;
