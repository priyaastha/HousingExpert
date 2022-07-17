import React from "react";
import { BsGithub, BsEnvelope, BsLinkedin } from "react-icons/bs";
import { Link } from "react-router-dom";
import "../../styles/footer.css";

const Footer = () => {
  return (
    <div className="footer pt-4 d-flex flex-column align-items-center justify-content-center bg-dark text-light p-4">
      <h6>&copy; Created By Astha Priya - 2022</h6>
      <div className="d-flex flex-row p-2">
        <p className="me-4" title="Github">
          <a href="https://github.com/priyaastha/HousingExpert">
            <BsGithub color="black" size={30} />
          </a>
        </p>
        <p className="me-4" title="Mail">
          <a href="mailto:priyaastha2710@gmail.com">
            <BsEnvelope color="black" size={30} />
          </a>
        </p>
        <p className="me-4" title="Linkedin">
          <a href="https://www.linkedin.com/in/priyaastha/">
            <BsLinkedin color="black" size={30} />
          </a>
        </p>
      </div>
    </div>
  );
};

export default Footer;
