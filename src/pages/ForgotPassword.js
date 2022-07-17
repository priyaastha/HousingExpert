import React, { useState } from "react";
import Layout from "./../components/Layout/Layout";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { toast } from "react-toastify";
import "../styles/forgotpassword.css";

const ForgotPassword = () => {

  //declaring states
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const onSubmitHandler = async (e) => {
    //prevents default behaviour of form
    e.preventDefault();
    
    //getAuth returns the Firebase auth object
    const auth = getAuth();
    //sendPasswordResetEmail sends an email to the user with a link to reset the password
    sendPasswordResetEmail(auth, email)
    //if email is sent successfully then show success message and navigate to signin page
    .then(() => {
      toast.success("Email was sent");
      navigate("/signin");
    })
    //if email is not sent successfully then show error message
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      toast.error(errorMessage);
      console.log(errorCode, errorMessage);
    });
  };

  return (
    <Layout title="forgot password page">
      <div className="row forgot-password-container">
        <div className="col-md-5 forgot-password-col2">
          <h1>Reset Your Password</h1>
          <form onSubmit={onSubmitHandler}>
            <div className=" mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-control"
                id="exampleInputEmail1"
                aria-describedby="emailHelp"
              />
              <div id="emailHelp" className="form-text">
                Reset email will be sent to this email
              </div>
            </div>
            <div className="d-flex justify-content-between btn-group">
              <button type="submit" className="btn ">
                Reset Password
              </button>
            </div>
            <div className="login-link">
              Go to <Link to="/signin">Sign In</Link> Page
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ForgotPassword;
