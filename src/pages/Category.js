import React, { useEffect, useState } from "react";
import Layout from "./../components/Layout/Layout";
import { useParams } from "react-router-dom";
import { db } from "./../firebase.config";
import { toast } from "react-toastify";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from "firebase/firestore";
import Spinner from "../components/Spinner";
import ListingItem from "../components/ListingItem";

const Category = () => {

  //declaring states
  const [listing, setListing] = useState("");
  const [lastFetchListing, setLastFetchListing] = useState(null);
  const [loading, setLoading] = useState(true);
  //useParams returns anobject of the url params
  const params = useParams();

  //fetch listing
  useEffect(() => {
    const fetchListing = async () => {
      try {
        //get reference to the listings table in db
        const listingsRef = collection(db, "listings");
        //query to get the first listing where category is same as category of url params
        const q = query(
          listingsRef,
          where("type", "==", params.categoryName),
          orderBy("timestamp", "desc"),
          limit(1)
        );
        //execute query
        //get the documents asked in the query
        const querySnap = await getDocs(q);
        //getting documents till the last fetched document        
        const lastVisible = querySnap.docs[querySnap.docs.length - 1];
        //set the last fetched document to the state
        setLastFetchListing(lastVisible);
        //array to store the listings
        const listings = [];
        //loop through all listings fetched from db and push them to the array
        querySnap.forEach((doc) => {
          return listings.push({
            id: doc.id,
            data: doc.data(),
          });
        });
        //set the array of listings to the state
        setListing(listings);
        //set the loading state to false
        setLoading(false);
      }
      //catch error if any
      catch (error) {
        console.log(error);
        toast.error("Unble to fetch data");
      }
    };
    //func call
    fetchListing();
  }, [params.categoryName]);

  //loadmore pagination func
  const fetchLoadMoreListing = async () => {
    try {
      //reference to the listings table in db
      const listingsRef = collection(db, "listings");
      //query to get next listings where category is same as category of url params
      const q = query(
        listingsRef,
        where("type", "==", params.categoryName),
        orderBy("timestamp", "desc"),
        startAfter(lastFetchListing),
        limit(10)
      );
      //execute query
      const querySnap = await getDocs(q);
      //getting documents till the last fetched document
      const lastVisible = querySnap.docs[querySnap.docs.length - 1];
      //set the last fetched document to the state
      setLastFetchListing(lastVisible);
      //array to store the fetched listings
      const listings = [];
      //loop through all the fetched documents and push them to the array
      querySnap.forEach((doc) => {
        return listings.push({
          id: doc.id,
          data: doc.data(),
        });
      });
      //set the array of listings to the state
      setListing((prevState) => [...prevState, ...listings]);
      //set the loading state to false
      setLoading(false);
    } 
    //catch error
    catch (error) {
      console.log(error);
      toast.error("Unble to fetch data");
    }
  };

  return (
    <Layout
      title={
        params.categoryName === "rent" ? "Places For Rent" : "Places For Sale"
      }
    >
    {/* title depends on which category is selected */}
      <div className="mt-3 container-fluid">
        <center>
          <h1>
            {params.categoryName === "rent"
              ? "Places For Rent"
              : "Places For Sale"}
          </h1>
        </center>
        {/* if loading is true show spinner, else show data fetched */}
        {loading ? (
          <Spinner />
        ) :
         //if atleast one listing is fetched, show them | else show no listing found for this category 
         listing && listing.length > 0 ? (
          <>
            <div>
              {listing.map((list) => (
                <ListingItem listing={list.data} id={list.id} key={list.id} />
              ))}
            </div>
          </>
        ) : (
          <p>No Listing For {params.categoryName} </p>
        )}
      </div>
      {/* if there are more listings to fetch, show load more button */}
      <div className="d-flex align-items-center justify-content-center mb-4 mt-4">
        {lastFetchListing && (
          <button
            className="btn btn-primary text-center"
            onClick={fetchLoadMoreListing}
          >
            Load More
          </button>
        )}
      </div>
    </Layout>
  );
};

export default Category;
