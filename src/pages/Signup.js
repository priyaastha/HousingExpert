import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "./../components/Layout/Layout";
import { toast } from "react-toastify";
import { BsFillEyeFill } from "react-icons/bs";
import { getAuth, createUserWithEmailAndPassword, updateProfile, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase.config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import OAuth from "../components/OAuth";
import "../styles/signup.css";

const Signup = () => {
  //declaring states
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    password: "",
  });
  const { name, email, password } = formData;

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
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };

  //signupHandler
  const onSubmitHndler = async (e) => {
    //prevents default behaviour of form
    e.preventDefault();
    //try catch block to handle error
    try {
      //to create a new user with email and password and return that user's credential
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      //if user is created then update the user's profile
      //userCredential.user is the user object containing the user's data
      const user = userCredential.user;
      //update the user's profile with the user's name(because earlier we didn't store the user's name in the db)
      updateProfile(auth.currentUser, { displayName: name });
      //destructuring the form data to get the user's email and name
      const formDataCopy = { ...formData };
      //delete the password from the form data (for security reasons)
      delete formDataCopy.password;
      //add timestamp value from server to the data
      formDataCopy.timestamp = serverTimestamp();
      //set the user's data in the db
      await setDoc(doc(db, "users", user.uid), formDataCopy);
      //now user is created, so show success message
      toast.success("Signup Successfully !");
      //navigate to the home page
      navigate("/");
    } 
    //else show error message
    catch (error) {
      console.log(error);
      toast.error("Something Went Wrong");
    }
  };
  return (
    <Layout title="Sign Up - Housing Expert">
      <div className="row signup-container">
        <div className="col-md-6 signup-container-col-2">
          <form onSubmit={onSubmitHndler}>
            <h3 className=" mt-2 text-center ">Sign Up </h3>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Name
              </label>
              <input
                type="text"
                value={name}
                className="form-control"
                id="name"
                onChange={onChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="exampleInputEmail1" className="form-label">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={onChange}
                className="form-control"
                id="email"
              />
            </div>
            <div className="mb-3">
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
            <div className="mb-3">
              Show Password
              <BsFillEyeFill
                className="text-danger ms-2  "
                style={{ cursor: "pointer" }}
                onClick={() => {
                  setShowPassword((prevState) => !prevState);
                }}
              />
            </div>
            <center>
            <button type="submit" className="btn signup-button">
              Sign up
            </button>
            <br></br>
            <span className="ms-4">Already an User?</span>{" "}
            <Link to="/signin">Login Here</Link>
            <div className="mt-3">
              <OAuth />
            </div>
            </center>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
