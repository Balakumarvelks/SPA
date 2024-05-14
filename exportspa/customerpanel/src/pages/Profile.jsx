import Cookies from 'js-cookie';
import React, { useEffect, useState } from 'react'
import { db } from '../config/firebase';
import { get, ref } from 'firebase/database';

const Profile = () => {
  const [userOrders, setUserOrders] = useState([]);

  const fetchOrders = async () => {
    try {
      const cookie = Cookies.get('malar_client_uid');
      if (!cookie) {
        console.log('User is not logged in.');
        return;
      }

      const ordersRef = ref(db, 'orders/');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const userOrders = Object.values(ordersData).filter(order => order.uid === cookie);
        setUserOrders(userOrders);
      } else {
        console.log('No orders found for the current user.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div>
      {userOrders.length === 0 ? (
        <p>No orders found for the current user</p>
      ) : (
        <ul>
          {userOrders.map((order, index) => (
            <li key={index}>
              <p>Date: {order.date}</p>
              <p>Product ID: {order.productid}</p>
              <p>Quantity: {order.quantity}</p>
              <p>Status: {order.status}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

}

export default Profile