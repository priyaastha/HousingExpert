import React, { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { BsFillEyeFill } from "react-icons/bs";
import Layout from "./../components/Layout/Layout";
import OAuth from "../components/OAuth";
import "../styles/signin.css";

const Signin = () => {

  //declaring states
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  //destructuring data 
  const { email, password } = formData;

  const navigate = useNavigate();

  //getAuth returns the Firebase auth object
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      //if logged in then set form data
      if (user) {
        navigate("/profile");
      } 
    });
  }, []);

  //handling onchange event for input fields of form
  const onChange = (e) => {
    //updatw state with new value of input fields
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  //loginHandler
  const loginHandler = async (e) => {
    //prevents default behaviour of form
    e.preventDefault();
    //try catch block to handle error
    //if credentials are correct then login user
    try {
      const auth = getAuth();
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      if (userCredential.user) {
        toast.success("Login Success");
        navigate("/");
      }
      //else show error message
    } catch (error) {
      console.log(error);
      toast.error("Invalid Email Or Password");
    }
  };

  return (
    <Layout title="Sign In - Housing Expert">
      <div className="row m-4 signin-container ">
        <div className="col-md-6 signin-container-col2 ">
          <form onSubmit={loginHandler}>
            <h4 className=" text-center">Sign In</h4>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={onChange}
                className="form-control"
                id="email"
              />
            </div>
            <div className="mb-2 ">
              <label htmlFor="exampleInputPassword1" className="form-label">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={onChange}
                className="form-control"
                id="password"
              />
            </div>
            <div className="mb-3 show-pass-forgot">
              <span>
                <BsFillEyeFill
                  className="text-danger ms-2 "
                  size={25}
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    setShowPassword((prevState) => !prevState);
                  }}
                />{" "}
                Show Password
              </span>{" "}
              |
              <Link to="/forgot-password" className="ms-4">
                Forgot Password
              </Link>
            </div>
            <center>
              <button type="submit" className="btn signinbutton">
                Sign in
              </button>
            <br></br>
            <span className="ms-4 new-user"> New User</span>{" "}
            <Link to="/signup">Sign up !</Link>
            </center>
            <OAuth />
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Signin;
