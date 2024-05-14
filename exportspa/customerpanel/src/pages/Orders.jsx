import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { get, ref, update } from 'firebase/database';

const Orders = () => {
  const [userOrders, setUserOrders] = useState([]);
  const [products, setProducts] = useState({});
  const fetchOrders = async () => {
    try {
      const ordersRef = ref(db, 'orders/');
      const snapshot = await get(ordersRef);
      if (snapshot.exists()) {
        const ordersData = snapshot.val();
        const userOrders = Object.entries(ordersData).map(([orderId, order]) => ({ ...order, orderId })); // Add orderId to each order object
        setUserOrders(userOrders);
      } else {
        console.log('No orders found.');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };




  const fetchProductDetails = async (productId) => {
    try {
      const productRef = ref(db, `products/${productId}`);
      const productSnapshot = await get(productRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.val();
        return productData;
      } else {
        console.log(`Product with ID ${productId} not found.`);
        return null;
      }
    } catch (error) {
      console.error(`Error fetching product details for ID ${productId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    const fetchProductsForOrders = async () => {
      const productIds = userOrders.flatMap(order => order.items.map(item => item.productid));
      const uniqueProductIds = [...new Set(productIds)];
      const productsData = {};
      for (const productId of uniqueProductIds) {
        const productDetails = await fetchProductDetails(productId);
        productsData[productId] = productDetails;
      }
      setProducts(productsData);
    };
    fetchProductsForOrders();
  }, [userOrders]);


  const cancelOrder = async (order) => {
    try {
      const orderId = order.orderId; // Access orderId instead of order.key
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status: 'Cancelled' });
      setUserOrders(prevOrders => prevOrders.map(o => {
        if (o.orderId === orderId) {
          return { ...o, status: 'Cancelled' };
        }
        return o;
      }));
      console.log('Order cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };




  return (
    <div className='container'>
      <h1 className='text-7xl text-center font-bold '>Orders</h1>
      <div className='p-3 '>
        {userOrders.length === 0 ? (
          <p>No orders found.</p>
        ) : (
          <ul className='row mt-4'>
            {userOrders.map((order, index) => (
              <li key={index} className=' col-lg-4 col-md-6 col-12 mb-3 '>
                <div className='p-3 border rounded-lg'>
                  <p>Date: {order.date}</p>
                  <ul className='p-3'>
                    {order.items.map((item, itemIndex) => (
                      <li key={itemIndex}>
                        <p>Product ID: {item.productid}</p>
                        <p>Product Name: {products[item.productid]?.productname}</p>

                        <img src={products[item.productid]?.productimage} />


                        <p>Quantity: {item.quantity}</p>
                 
                      </li>
                    ))}
                  </ul>
                  <p>Payment Method: {order.paymentMethod}</p>
                  <p className='font-bold'>Status: {order.status}</p>
      
                  {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                    <button className='bg-red-500 text-white py-1 px-2 rounded' onClick={() => cancelOrder(order)}>Cancel</button>
                  )}


                </div>

              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Orders;
