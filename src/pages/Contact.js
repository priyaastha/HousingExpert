import React, { useState, useEffect } from "react";
import Layout from "../components/Layout/Layout";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase.config";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { toast } from "react-toastify";
import "../styles/contact.css";

const Contact = () => {
  const [message, setMessage] = useState("");
  const [landlord, setLandlord] = useState("");
  const [searchParams, setSearchParams] = useSearchParams(); //eslint-disable-line
  const params = useParams();

  const navigate = useNavigate();

  //getAuth returns the Firebase auth object
  const auth = getAuth();

  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      //if logged in then set form data
      if (!user) {
        navigate("/signin");
      } 
    });
  }, []);

  //handling onchange event for input fields of form
  useEffect(() => {
    //to get landlord details
    const getLandlord = async () => {
      //get reference to user table with id = landlordId
      const docRef = doc(db, "users", params.landlordId);
      //get data from user table
      const docSnap = await getDoc(docRef);
      //if such user exists, show page with details of landlord
      if (docSnap.exists()) {
        setLandlord(docSnap.data());
      } 
      //else, show error message
      else {
        toast.error("Unble to fetch data");
      }
    };
    getLandlord();
  }, [params.landlordId]);
  return (
    <Layout title="contact details - house marketplace">
      <div className="row contact-container">
        <div className="col-md-6 contact-container-col-1">
          <img src="/assets/con.webp" alt="contact" />
        </div>
        <div className="col-md-6 contact-container-col-2">
          <h1>Contact Details</h1>
          <div>
            {landlord !== "" && (
              <main>
                {/* Get landlord name */}
                <h3 className="mb-4">
                  Person Name :{" "}
                  <span style={{ color: "#003366" }}>
                    {" "}
                    " {landlord?.name} "{" "}
                  </span>
                </h3>
                {/* For writing message */}
                <div className="form-floating">
                  <textarea
                    className="form-control"
                    placeholder="Leave a comment here"
                    value={message}
                    id="message"
                    onChange={(e) => {
                      setMessage(e.target.value);
                    }}
                  />
                  <label
                    htmlFor="floatingTextarea"
                    style={{ color: "lightgray" }}
                  >
                    type your message here
                  </label>
                </div>
                {/* the button links to mail and sends subject as house name and the body as message */}
                <a
                  href={`mailto:${landlord.email}?Subject=${searchParams.get(
                    "listingName"
                  )}&body=${message}`}
                >
                  <button className="btn mt-2">Send Message</button>
                </a>
              </main>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Contact;
