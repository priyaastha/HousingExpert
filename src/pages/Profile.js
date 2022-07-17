import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import Layout from "../components/Layout/Layout";
import { getAuth, updateProfile } from "firebase/auth";
import { db } from "../firebase.config";
import { FaEdit, FaArrowAltCircleRight } from "react-icons/fa";
import { MdDoneOutline } from "react-icons/md";
import {
  doc,
  updateDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
} from "firebase/firestore";
import ListingItem from "../components/ListingItem";
import "../styles/profile.css";

const Profile = () => {
  //getAuth returns firebase auth object
  const auth = getAuth();
  
  const navigate = useNavigate();
  //declaring states
  //eslint-disable-next-line
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState(null);

  //useeffect for getting data
  useEffect(() => {
    //fetch house listings of the signed in user
    const fetchUserListings = async () => {
      //get reference to the listings table in db
      const listingRef = collection(db, "listings");
      //get all listings of the signed in user in descending order of timestamp
      const q = query(
        listingRef,
        where("useRef", "==", auth.currentUser.uid),
        orderBy("timestamp", "desc")
      );
      const querySnap = await getDocs(q);
      console.log(querySnap);
      //array to store listings fetched from db
      let listings = [];
      //loop through all listings of the signed in user fetched from db and push them to the array
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      console.log(listings);
      //set the array of listings to the state
      setListings(listings);
      setLoading(false);
    };
    //call the function to fetch the data
    fetchUserListings();
  }, [auth.currentUser.uid]);

  const [changeDetails, setChangeDetails] = useState(false);
  const [formData, setFormData] = useState({
    name: auth.currentUser.displayName,
    email: auth.currentUser.email,
  });
  const { name, email } = formData;

  const logoutHandler = () => {
    //sign out the user
    auth.signOut();
    toast.success("Successfully Logout");
    navigate("/signin");
  };

  //onChange
  const onChange = (e) => {
    //set the state of the formData to the value of the input
    setFormData((prevState) => ({
      ...prevState,
      [e.target.id]: e.target.value,
    }));
  };
  //submit handler
  const onSubmit = async () => {
    try {
      //If there are changes in the name, update the name of the user 
      if (auth.currentUser.displayName !== name) {
        //for current user profile update the display name field (for authentication part)
        await updateProfile(auth.currentUser, {
          displayName: name,
        });
        //get refernce to the current users' data in db
        const userRef = doc(db, "users", auth.currentUser.uid);
        //update the name field in the db
        await updateDoc(userRef, { name });
        //show success message
        toast.success("User Updated!");
      }
    } 
    //catch any errors
    catch (error) {
      console.log(error);
      toast("Something Went Wrong");
    }
  };

  //delete handler
  const onDelete = async (listingId) => {
    //if the user confirms the delete
    if (window.confirm("Are You Sure  want to delete ?")) {
      //get reference to the listing in listings table in db which has the id of the listing to be deleted & delete it
      console.log(listingId);
      await deleteDoc(doc(db, "listings", listingId));
      //show all listings of user except the currently deleted listing
      const updatedListings = listings.filter(
        (listing) => listing.id !== listingId
      );
      //set the state of listings to the updated listings
      setListings(updatedListings);
      //show success message
      toast.success("Listing Deleted Successfully");
    }
  };

  //on clicking edit button, navigate to edit listing page with the listing id as a parameter  
  const onEdit = (listingId) => {
    navigate(`/editlisting/${listingId}`);
  };
  return (
    <Layout>
      <div className="row profile-container">
        <div className="col-md-6 profile-container-col1">
          <img src="./assets/pro.jpg" alt="profile" />
        </div>
        <div className="col-md-6 profile-container-col2">
          <div className="container mt-4  d-flex justify-content-between">
            <h2>Profile Details</h2>
            <button className="btn btn-danger" onClick={logoutHandler}>
              Logout
            </button>
          </div>
          <div className="   mt-4 card">
            <div className="card-header">
              <div className="d-flex justify-content-between ">
                <p>Your Personal Details </p>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    changeDetails && onSubmit();
                    setChangeDetails((prevState) => !prevState);
                  }}
                >
                  {changeDetails ? (
                    <MdDoneOutline color="green" />
                  ) : (
                    <FaEdit color="red" />
                  )}
                </span>
              </div>
            </div>
            <div className="card-body">
              <form>
                <div className="mb-3">
                  <label htmlFor="exampleInputPassword1" className="form-label">
                    Name
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="name"
                    value={name}
                    onChange={onChange}
                    disabled={!changeDetails}
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="exampleInputEmail1" className="form-label">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    className="form-control"
                    id="email"
                    aria-describedby="emailHelp"
                    onChange={onChange}
                    disabled={true}
                  />
                </div>
              </form>
            </div>
          </div>
          <div className="mt-3 create-listing">
            <Link to="/create-listing">
              <FaArrowAltCircleRight color="primary" /> Sell or Rent Your Home
            </Link>
          </div>
        </div>
      </div>

      <div className="container-fluid mt-4 your-listings">
        {listings && listings?.length > 0 && (
          <>
            <h3 className="mt-4">Your Listings</h3>
            <div>
              {listings.map((listing) => (
                <ListingItem
                  className="profile-listing"
                  key={listing.id}
                  listing={listing.data}
                  id={listing.id}
                  onDelete={() => onDelete(listing.id)}
                  onEdit={() => onEdit(listing.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Profile;
