/* eslint-disable default-case */
import React, { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import Layout from "./../components/Layout/Layout";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Spinner from "../components/Spinner";
import { AiOutlineFileAdd } from "react-icons/ai";
import { toast } from "react-toastify";
import { getStorage, ref, uploadBytesResumable, getDownloadURL, } from "firebase/storage";
import { db } from "../firebase.config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

const CreateListing = () => {

  //declare state
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "rent",
    name: "",
    bedrooms: 1,
    bathrooms: 1,
    parking: false,
    furnished: false,
    address: "",
    offer: false,
    regularPrice: 0,
    discountedPrice: 0,
    images: {}
  });

  //destructuring formData
  const {
    type,
    name,
    bedrooms,
    bathrooms,
    address,
    offer,
    regularPrice,
    discountedPrice,
    images,
  } = formData;

  //getAuth returns instance of auth object
  const auth = getAuth();
  //useNavigate is hook to navigate to different pages
  const navigate = useNavigate();

  //to check if user is logged in or not
  useEffect(() => {
    onAuthStateChanged(auth, (user) => {
      //if logged in then set form data
      if (user) {
        setFormData({
          ...formData,
          useRef: user.uid,
        });
      } 
      //if not logged in then navigate to signin page
      else {
        navigate("/signin");
      }
    });
  }, []);
  
  //if loading is true, show spinner
  if (loading) {
    return <Spinner />;
  }

  //mutate func
  const onChangeHandler = (e) => {
    //for each boolean input, set the value of the input to selected value
    let boolean = null; 
    if (e.target.value === "true") {
      boolean = true;
    }
    if (e.target.value === "false") {
      boolean = false;
    }
    //files
    if (e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        images: e.target.files,
      }));
    }
    //text/booleans/number
    if (!e.target.files) {
      setFormData((prevState) => ({
        ...prevState,
        [e.target.id]: boolean ?? e.target.value,
      }));
    }
  };

  //form submit
  const onSubmit = async (e) => {
    //prevent default behaviour of form
    e.preventDefault();
    //if discounted price is greater than regular price, show error
    if (discountedPrice >= regularPrice) {
      setLoading(false);
      toast.error("Discount Price should be less than Regular Price");
      return;
    }
    //if images are more than 6, show error
    if (images > 6) {
      setLoading(false);
      toast.error("Max 6 Images can be selected");
      return;
    }    

    //store images to firebase storage
    const storeImage = async (image) => {
      //returns a promise
      return new Promise((resolve, reject) => {
        //get storage reference
        const storage = getStorage();
        //give a name to the image
        const fileName = `${auth.currentUser.uid}-${image.name}-${uuidv4()}`;
        //upload image to storage 
        const storageRef = ref(storage, "images/" + fileName);
        //upload image to storage
        //uploadBytesResumable is a function that accepts the storage reference and uploads the image
        const uploadTask = uploadBytesResumable(storageRef, image);
        //here we are listening to the upload task, it has 3 events - progress, error and complete
        uploadTask.on(
          //progress event
          "state_changed",
          (snapshot) => {
            //calculate progress of the upload and show it in the console
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("upload is" + progress + "% done");
            switch (snapshot.state) {
              //if upload is paused
              case "paused":
                console.log("upload is paused");
                break;
              //if upload is running
              case "running":
                console.log("upload is runnning");
            }
          },
          //error event
          (error) => {
            //reject the promise if there is an error
            reject(error);
          },
          //success event
          () => {
            //if upload is complete, get the download url of the image and resolve the promise
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      });
    };
    //to upload images to firebase storage, we fetch images in array from formData and for each image, we call storeImage function
    const imgUrls = await Promise.all(
      [...images].map((image) => storeImage(image))
    ).catch(() => {
      setLoading(false);
      toast.error("Images not uploaded. Please Check for image size!");
      return;
    });
    console.log(imgUrls);

    //save form data
    const formDataCopy = {
      ...formData,
      imgUrls,
      timestamp: serverTimestamp(),
    };
    formData.location = address;
    delete formDataCopy.images;
    //if no offer, then delete offer price
    !formDataCopy.offer && delete formDataCopy.discountedPrice;
    //add form data to firebase database
    const docRef = await addDoc(collection(db, "listings"), formDataCopy);
    //show success message
    toast.success("Listing Created!");
    //set loading to false
    setLoading(false);
    //navigate to listings page
    navigate(`/category/${formDataCopy.type}/${docRef.id}`);
  };

  return (
    <Layout>
      <div className="container d-flex flex-column align-items-center justify-content-center mb-4">
        <h3 className="mt-3 w-50 bg-dark text-light p-2 text-center">
          Create Listing &nbsp;
          <AiOutlineFileAdd />
        </h3>
        
        <form className="w-50 bg-light p-4" onSubmit={onSubmit}>
          <center>
            <p style={{color:"grey",padding:"0px"}}>All fields are required</p>
          </center>
          <div className="d-flex flex-row mt-4">
            <div className="form-check">
              {/*radio button for rent/sell*/}
              <input
                className="form-check-input"
                type="radio"
                value="rent"
                onChange={onChangeHandler}
                defaultChecked
                name="type"
                id="type"
              />
              <label className="form-check-label" htmlFor="rent">
                Rent
              </label>
            </div>
            <div className="form-check ms-3">
              <input
                className="form-check-input"
                type="radio"
                name="type"
                value="sale"
                onChange={onChangeHandler}
                id="type"
              />
              <label className="form-check-label" htmlFor="sale">
                Sale
              </label>
            </div>
          </div>
          {/* name */}
          <div className="mb-3 mt-4">
            <label htmlFor="name" className="form-label">
              Name
            </label>
            <input
              type="text"
              className="form-control"
              id="name"
              value={name}
              onChange={onChangeHandler}
              required
            />
          </div>
          {/* bedrooms */}
          <div className="mb-3 mt-4">
            <label htmlFor="bedrooms" className="form-label">
              Bedrooms
            </label>
            <input
              type="number"
              className="form-control"
              id="bedrooms"
              value={bedrooms}
              onChange={onChangeHandler}
              required
            />
          </div>
          {/* bathrooms */}
          <div className="mb-3 mt-4">
            <label htmlFor="bathrooms" className="form-label">
              Bathrooms
            </label>
            <input
              type="number"
              className="form-control"
              id="bathrooms"
              value={bathrooms}
              onChange={onChangeHandler}
              required
            />
          </div>
          {/* parking */}
          <div className="mb-3 ">
            <label htmlFor="parking" className="form-label">
              Parking :
            </label>
            <div className="d-flex flex-row ">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  value={true}
                  onChange={onChangeHandler}
                  name="parking"
                  id="parking"
                />
                <label className="form-check-label" htmlFor="yes">
                  Yes
                </label>
              </div>
              <div className="form-check ms-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="parking"
                  value={false}
                  defaultChecked
                  onChange={onChangeHandler}
                  id="parking"
                />
                <label className="form-check-label" htmlFor="no">
                  No
                </label>
              </div>
            </div>
          </div>
          {/* furnished */}
          <div className="mb-3 ">
            <label htmlFor="furnished" className="form-label">
              Furnished :
            </label>
            <div className="d-flex flex-row ">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  value={true}
                  onChange={onChangeHandler}
                  name="furnished"
                  id="furnished"
                />
                <label className="form-check-label" htmlFor="yes">
                  Yes
                </label>
              </div>
              <div className="form-check ms-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="furnished"
                  value={false}
                  defaultChecked
                  onChange={onChangeHandler}
                  id="furnished"
                />
                <label className="form-check-label" htmlFor="no">
                  No
                </label>
              </div>
            </div>
          </div>
          {/* address */}
          <div className="mb-3">
            <label htmlFor="address">Address :</label>
            <textarea
              className="form-control"
              placeholder="Enter Your Address"
              id="address"
              value={address}
              onChange={onChangeHandler}
              required
            />
          </div>
          {/* offers  */}
          <div className="mb-3 ">
            <label htmlFor="offer" className="form-label">
              Offer :
            </label>
            <div className="d-flex flex-row ">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  value={true}
                  onChange={onChangeHandler}
                  name="offer"
                  id="offer"
                />
                <label className="form-check-label" htmlFor="yes">
                  Yes
                </label>
              </div>
              <div className="form-check ms-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="offer"
                  value={false}
                  defaultChecked
                  onChange={onChangeHandler}
                  id="offer"
                />
                <label className="form-check-label" htmlFor="no">
                  No
                </label>
              </div>
            </div>
          </div>
          {/* regular price */}
          <div className="mb-3 mt-4">
            <label htmlFor="name" className="form-label">
              Regular Price :
            </label>
            <div className=" d-flex flex-row ">
              <input
                type="number"
                className="form-control w-50 "
                id="regularPrice"
                name="regularPrice"
                value={regularPrice}
                onChange={onChangeHandler}
                required
              />
              {type === "rent" && <p className="ms-4 mt-2">$ / Month</p>}
            </div>
          </div>
          {/* offer (if offfer is there, show this) */}
          {offer && (
            <div className="mb-3 mt-4">
              <label htmlFor="discountedPrice" className="form-label">
                Discounted Price :
              </label>

              <input
                type="number"
                className="form-control w-50 "
                id="discountedPrice"
                name="discountedPrice"
                value={discountedPrice}
                onChange={onChangeHandler}
                required
              />
            </div>
          )}

          {/* files images etc */}
          <div className="mb-3">
            <label htmlFor="formFile" className="form-label">
              select images :
            </label>
            <input
              className="form-control"
              type="file"
              id="images"
              name="images"
              onChange={onChangeHandler}
              max="6"
              accept=".jpg,.png,.jpeg"
              multiple
              required
            />
          </div>
          {/* submit button */}
          <div className="mb-3">
            <input
              disabled={!name || !address || !regularPrice || !images}
              className="btn btn-primary w-100"
              type="submit"
              value="Create Listing"
            />
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateListing;
