import { Navigate, Outlet } from "react-router-dom";

import React from "react";
import useAuthState from "./../hooks/useAuthState";
import Spinner from "./Spinner";

const PrivateRoute = () => {
  const { loggedIn, checkState } = useAuthState();

  if (checkState) {
    return <Spinner />;
  }
  //outlet in react router is used to render the component based on the path
  return loggedIn ? <Outlet /> : <Navigate to="/signin" />;
};

export default PrivateRoute;
