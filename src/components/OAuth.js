import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase.config";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

const OAuth = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const onGoolgleAuthHandler = async () => {
    try {
      //getAuth returns the Firebase auth object
      const auth = getAuth();
      //Create an instance of the Google provider object
      const provider = new GoogleAuthProvider();
      //Sign in using the Google provider and show a popup
      const result = await signInWithPopup(auth, provider);
      //Get the signed in user's information
      const user = result.user;
      //fetches reference from users table in db whose uid is passed (i.e. signed in user) 
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      //if user is not in users table, add them
      if (!docSnap.exists()) {
        //create a new user object with the user's information and add it to the users table in db
        await setDoc(doc(db, "users", user.uid), {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      //redirect to home page
      navigate("/");
    } 
    //catch any errors
    catch (error) {
      toast.error("Problem With Google Auth ");
    }
  };

  return (
    <div>
      <h3 className="mt-4 text-center ">
        Sign {location.pathname === "/signup" ? "Up" : "In"} With
        <button
          onClick={onGoolgleAuthHandler}
          style={{
            outline: "none",
            backgroundColor: "transparent",
            border: "none",
            borderBottom: "1px solid black",
          }}
        >
          <span>
            <FcGoogle />
            oogle
          </span>
        </button>
      </h3>
    </div>
  );
};

export default OAuth;
