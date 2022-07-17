import React from "react";
import Footer from "./Footer";
import Header from "./Header";
import { Helmet } from "react-helmet";
const Layout = ({ children, title }) => {
  return (
    <>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{title}</title>
      </Helmet>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
};

Layout.defaultProps = {
  title: "Housing Expert - To Help You Find The Home Of Your Dreams",
};

export default Layout;
