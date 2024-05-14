import { get, ref } from 'firebase/database';
import React, { useEffect, useState } from 'react'
import { db } from '../config/firebase';

const Home = () => {


  const [data, setData] = useState([])
  const fetchData = async () => {
    try {
      const snapshot = await get(ref(db, 'customers'));
      if (snapshot.exists()) {
        const data = snapshot.val();

        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setData(dataArray);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch data from Firebase on component mount
  useEffect(() => {
    fetchData();
  }, []);


  return (
    <div>Home</div>
  )
}

export default Home