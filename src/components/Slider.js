import React, { useState, useEffect } from "react";
import { ImLocation2 } from "react-icons/im";
import { db } from "../firebase.config";
import "../styles/slider.css";
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
//navigation to move to prev or next, effectcoverflow to provide effects,pagination - the bullets at the below
import SwipeCore, { EffectCoverflow, Pagination } from "swiper";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper-bundle.min.css";
import "swiper/swiper.min.css";
import Spinner from "./Spinner";

//config
SwipeCore.use([EffectCoverflow, Pagination]);

const Slider = () => {
  const [listings, setListings] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  useEffect(() => {
    //function to fectch the list of recently added homes from db
    const fetchListings = async () => {
      //get the reference to table listings from the db
      const listingRef = collection(db, "listings");
      //query to fetch 5 recently added data
      const q = query(listingRef, orderBy("timestamp", "desc"), limit(5));
      //get data that refers to q
      const querySnap = await getDocs(q);
      let listings = [];
      //for each doc fetched, get it's id and data
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //set loading to false after data is fetched
      setLoading(false);
      //store the fetched data in a state
      setListings(listings);
    };
    //call function 
    fetchListings();
    //print in console
    console.log(listings === null ? "loading" : listings);
    // eslint-disable-next-line
  }, []);

  //if loading is true, return spinner
  if (loading) {
    return <Spinner />;
  }

  return (
    <>
      <div style={{ width: "100%" }}>
        {/*show spinner till the data is fetched, then show the sliders*/}
        {listings === null ? (
          <Spinner />
        ) : (
          <Swiper
            effect={"coverflow"}
            centeredSlides={true}
            slidesPerView={1}
            coverflowEffect={{
              rotate: 50,
              stretch: 0,
              depth: 100,
              modifier: 1,
              slideShadows: true,
            }}
            spaceBetween={30}
            pagination={{
              clickable: true,
            }}
            modules={[Pagination]}
            className="mySwipe"
          >
            {/* Show data fetched in one slider each | when clicked on them, go to that data's page*/}
            {listings.map(({ data, id }) => (
              <SwiperSlide
                key={id}
                onClick={() => {
                  navigate(`/category/${data.type}/${id}`);
                }}
              >
                <img
                  src={data.imgUrls[0]}
                  alt={data.name}
                  className="slider-img"
                />
                <h4 className=" text-light p-4 m-0 ">
                  <ImLocation2 size={20} className="ms-2" /> Recently Added :{" "}
                  <br />
                  <span className="ms-4 mt-2"> Name : {data.name}</span>
                  <span className="ms-2">
                    | Price : $ {data.regularPrice} 
                  </span>
                </h4>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </>
  );
};

export default Slider;