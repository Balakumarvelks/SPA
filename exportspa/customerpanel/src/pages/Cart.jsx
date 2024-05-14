import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { ref, get, query, orderByChild, update, remove, push } from 'firebase/database';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import qrcode from '../assets/qr.png'

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);




  const fetchCartItems = async () => {
    try {
      const cookie = Cookies.get('malar_client_uid');
      if (!cookie) {
        console.log('User is not logged in.');
        return;
      }

      const cartRef = ref(db, 'cart/');
      const cartQuery = query(cartRef, orderByChild('uid'));

      const snapshot = await get(cartQuery);
      if (snapshot.exists()) {
        const cartItemsData = snapshot.val();
        const filteredCartItems = Object.entries(cartItemsData)
          .filter(([key, item]) => item.uid === cookie)
          .map(([cartId, item]) => ({ ...item, cartId }));
        setCartItems(filteredCartItems);

        await fetchProductDetails(filteredCartItems);
      } else {
        console.log('No cart items found.');
      }
    } catch (error) {
      console.error('Error fetching cart items:', error);
    }
  };

  const fetchProductDetails = async (cartItems) => {
    const productIds = cartItems.map(item => item.productid);
    const productDetails = [];

    for (const productId of productIds) {
      const productRef = ref(db, `products/${productId}`);
      const productSnapshot = await get(productRef);
      if (productSnapshot.exists()) {
        const productData = productSnapshot.val();
        productDetails.push(productData);
      }
    }

    setProducts(productDetails);
  };

  useEffect(() => {

    fetchCartItems()
  }, []); // Empty dependency array ensures the effect runs only once after the component mounts


  const handleAddItem = async (index) => {
    const updatedCartItems = [...cartItems];
    updatedCartItems[index].quantity++;
    setCartItems(updatedCartItems);

    const cartId = updatedCartItems[index].cartId;
    const quantity = updatedCartItems[index].quantity;
    const cartItemRef = ref(db, `cart/${cartId}`);
    await update(cartItemRef, { quantity });
  };

  const handleRemoveItem = async (index) => {
    const updatedCartItems = [...cartItems];
    if (updatedCartItems[index].quantity === 1) {
      const cartId = updatedCartItems[index].cartId;
      const cartItemRef = ref(db, `cart/${cartId}`);
      await remove(cartItemRef);
      updatedCartItems.splice(index, 1);
    } else {
      updatedCartItems[index].quantity--;
    }
    setCartItems(updatedCartItems);
  };

  const gotoBilling = async () => {
    try {
      const cookie = Cookies.get('malar_client_uid');
      if (!cookie) {
        console.log('User is not logged in.');
        return;
      }

      const { value: paymentMethod } = await Swal.fire({
        title: 'Select Payment Method',
        input: 'radio',
        inputOptions: {
          'offline': 'Offline Payment',
          'online': 'Online Payment'
        },
        inputValidator: (value) => {
          if (!value) {
            return 'You must choose a payment method';
          }
        }
      });

      if (!paymentMethod) {
        console.log('No payment method selected.');
        return;
      }

      const currentDate = new Date().toISOString(); // Get current date in ISO format

      const cartRef = ref(db, 'cart/');
      const snapshot = await get(cartRef);
      if (snapshot.exists()) {
        const cartItemsData = snapshot.val();
        const userCartItems = Object.values(cartItemsData).filter(item => item.uid === cookie);
        if (userCartItems.length > 0) {
          const ordersRef = ref(db, 'orders/');

          // Create the order object with date, status, uid, and payment method
          const order = {
            date: currentDate,
            status: "Processing",
            uid: cookie,
            paymentMethod: paymentMethod,
            items: userCartItems // Include the array of order items
          };

          if (paymentMethod === 'offline') {
            // Push the order to the database for offline payment
            await push(ordersRef, order);
            await remove(cartRef);
            setCartItems([]);
            console.log('Offline Checkout successful!');
            Swal.fire('Offline Checkout successful!');
          } else if (paymentMethod === 'online') {
            // Display QR code for online payment
        
            Swal.fire({
              title: 'Scan QR Code for Online Payment',
              imageUrl: qrcode,
              imageWidth: 200,
              imageHeight: 200,
              imageAlt: 'QR Code',
              showCancelButton: true,
              cancelButtonText: 'Cancel',
              showConfirmButton: true,
              confirmButtonText: 'Confirm Online Payment'
            }).then(async (result) => {
              if (result.isConfirmed) {
                // Push the order to the database for online payment
                await push(ordersRef, order);
                await remove(cartRef);
                setCartItems([]);
                console.log('Online Checkout successful!');
                Swal.fire('Online Checkout successful!');
              }
            });
          }
        } else {
          console.log('No cart items found for the current user.');
          alert('No cart items found for the current user.');
        }
      } else {
        console.log('No cart items found.');
        alert('No cart items found.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
      alert('Error during checkout:');
    }
  };






  return (
    <div>
      {cartItems.length === 0 ? (

        <div>
          <p className='text-center mt-3'>No items in the cart
          </p>
          <div className='text-center mt-3'>
            <button onClick={fetchCartItems} className='bg-white p-3 rounded-lg text-white'>Refresh</button>
          </div>
        </div>
      ) : (
        <>
          <ul>
            {cartItems.map((item, index) => (
              <li key={index} className='border p-3 rounded-lg mb-3 mt-6'>
                {products[index] && (
                  <>
                    <div>
                      <img src={products[index].productimage} />
                      <div className='flex justify-between'>
                        <h1 className='text-4xl'>{products[index].productname}</h1>
                        <div>
                          <h1 className='text-4xl'> ₹ {products[index].productprice}</h1>
                          <h1 className='text-2xl'>Total: ₹ {products[index].productprice * item.quantity}</h1>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className='flex flex-row justify-between mt-3'>
                  <div className='bg-white text-white rounded-lg p-3' onClick={() => handleAddItem(index)}>
                    <span className="material-symbols-outlined">add</span>
                  </div>
                  <div className='text-6xl'>{item.quantity}</div>
                  <div className='bg-white text-white rounded-lg p-3' onClick={() => handleRemoveItem(index)}>
                    <span className="material-symbols-outlined">remove</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          {products.length > 0 && ( // Check if products array is not empty
            <h1>Total: ₹ {cartItems.reduce((total, item, index) => total + (products[index].productprice * item.quantity), 0)}</h1>
          )}

          <button className='bg-white text-white rounded-lg p-3 mt-3 w-full' onClick={gotoBilling}>
            Checkout
          </button>
        </>
      )}
    </div>
  );

};

export default Cart;
