import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase';
import { ref, get, push, orderByChild, query, equalTo } from 'firebase/database';
import Cookies from 'js-cookie';

const Home = () => {
    const [data, setData] = useState([]);

    const fetchData = async () => {
        try {
            const snapshot = await get(ref(db, 'products'));
            if (snapshot.exists()) {
                const data = snapshot.val();
                const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
                dataArray.sort((a, b) => a.productrank - b.productrank);
                setData(dataArray);
            } else {
                setData([]);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addtocart = async (productid) => {
        const cookie = Cookies.get('malar_client_uid');
        if (!cookie) {
            alert('Login to Access Cart');
            return; // Exit the function if user is not logged in
        }

        const cartRef = ref(db, 'cart/');
        const cartQuery = query(cartRef, orderByChild('uid'), equalTo(cookie)); // Query to check if user already has the product in cart

        try {
            const snapshot = await get(cartQuery);
            if (snapshot.exists()) {
                // Check if the product already exists in the user's cart
                const cartEntries = snapshot.val();
                const cartEntryKeys = Object.keys(cartEntries);
                const existingEntryKey = cartEntryKeys.find(key => cartEntries[key].productid === productid);

                if (existingEntryKey) {
                    alert('Item already exists in your cart.');
                } else {
                    // Product does not exist in cart, add it
                    push(ref(db, 'cart/'), {
                        productid: productid,
                        uid: cookie,
                        quantity: 1
                    });
                    alert('Item added to cart successfully.');
                    console.log('Item added to cart successfully.');
                }
            } else {
                // User does not have any items in cart, add the product
                push(ref(db, 'cart/'), {
                    productid: productid,
                    uid: cookie,
                    quantity: 1
                });
                alert('Item added to cart successfully.');
                console.log('Item added to cart successfully.');
            }
        } catch (error) {
            alert('Error adding item to cart');
            console.error('Error adding item to cart:', error);
        }
    };

    const addReview = async (productId) => {
        const review = prompt('Add your review:');
        if (review && review.trim() !== '') {
            try {
                await push(ref(db, `products/${productId}/reviews`), {
                    review: review.trim(),
                    userId: Cookies.get('malar_client_uid')
                });
                alert('Review added successfully.');
            } catch (error) {
                console.error('Error adding review:', error);
                alert('Failed to add review.');
            }
        } else {
            alert('Review cannot be empty.');
        }
    };


    const ReviewSection = ({ reviews }) => {
        const [expanded, setExpanded] = useState(false);

        const toggleExpansion = () => {
            setExpanded(!expanded);
        };

        return (
            <div>
                <button onClick={toggleExpansion}>
                    {expanded ? 'Hide Reviews' : 'View Reviews'}
                </button>
                {expanded && (
                    <div>
                        {reviews && Object.values(reviews).map((review, index) => (
                            <p key={index} className='p-3 border rounded-lg mb-3'>{review.review} - by  {review.userId}</p>
                        ))}
                    </div>
                )}
            </div>
        );
    };


    const [filteredData, setFilteredData] = useState([]);

    useEffect(() => {
        if (data.length > 0) {
            setFilteredData([...data]); // Initially set filtered data to all products
        }
    }, [data]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedType, setSelectedType] = useState('');


    const handleSearch = (e) => {
        const term = e.target.value.toLowerCase(); // Convert search term to lowercase
        setSearchTerm(term);
        filterData(selectedType, term); // Pass the lowercase search term to filterData
    };

    const handleTypeChange = (e) => {
        const type = e.target.value; // Get the selected type from the event
        setSelectedType(type); // Update the selectedType state
        filterData(type, searchTerm); // Call filterData with the updated type and current searchTerm
    };

    const filterData = (type, searchTerm) => {
        let filtered = [...data]; // Create a copy of the original data array

        // Apply type filter if type is selected
        if (type) {
            filtered = filtered.filter(product => product.producttype === type);
        }

        // Apply search term filter if search term is not empty
        if (searchTerm) {
            filtered = filtered.filter(product =>
                product.productname.toLowerCase().includes(searchTerm) ||
                product.producttype.toLowerCase().includes(searchTerm)
            );
        }

        // If both search term and type are empty, show all data
        if (!searchTerm && !type) {
            setFilteredData([...data]); // Set filtered data to the entire data array
        } else {
            setFilteredData(filtered); // Set filtered data to the filtered array
        }
    };


    return (
        <div>
            <div className='container'>
                <div className="col-lg-12 mb-3">
                    <input
                        className='form-control mb-3'
                        type="text"
                        placeholder="Search by product name"
                        value={searchTerm}
                        onChange={handleSearch}
                    />
                    {/* <select value={selectedType} onChange={handleTypeChange} className='form-control '>
                        <option value="">All Types</option>
                        <option value="Shirt">Shirt</option>
                        <option value="Pant">Pant</option>
                        <option value="T-Shirt">T-Shirt</option>
     
                    </select> */}
                </div>
                <div className='row'>
                    {filteredData.map(product => (
                        <div className='col-lg-3 col-md-6 col-12 mb-3' key={product.id}>
                            <div className='border p-3 font-bold rounded-lg'>

                                <h1 className='text-5xl'>{product.productname}</h1>
                                <h1>{product.producttype}</h1>

                                <div className='flex justify-center mb-3'>
                                    <img src={product.productimage} alt={product.productname} className='img-fluid' />
                                </div>
                                <div className='border p-2 mb-3'>
                                    <p>{product.productdes}</p>

                                </div>
                                <div className='flex flex-row justify-between'>
                                    <h1 className='text-3xl'>₹{product.productprice}</h1>
                                    <button className='bg-black text-white p-2 rounded-lg' onClick={() => addtocart(product.id)}>Add to Cart</button>
                                    <button className='bg-blue-500 text-white p-2 rounded-lg' onClick={() => addReview(product.id)}>Add Review</button>
                                </div>

                                <div className=''>
                                    <ReviewSection reviews={product.reviews} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Home;
