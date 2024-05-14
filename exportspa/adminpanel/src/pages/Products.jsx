import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'


import { ref as storageRefer, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as dbRef, get, push, ref, remove, set } from 'firebase/database';
import { db, storage } from '../config/firebase';
import { toast } from 'react-toastify';
import { AgGridReact } from 'ag-grid-react';

const Products = ({ makeItSpin }) => {
  const { handleSubmit, register } = useForm()

  const [addproduct, setaddproduct] = useState(false)

  const onSubmit = async (values) => {
    makeItSpin(true)
    const file = values.productimage[0];

    // Create a reference to the Firebase Storage location where you want to store the file
    const storageRef = storageRefer(storage, 'product_images/' + file.name);

    try {
      // Upload the file to Firebase Storage
      await uploadBytes(storageRef, file);

      // Get the download URL of the uploaded file
      const downloadURL = await getDownloadURL(storageRef);

      // Save other product details along with the image URL to the Realtime Database
      const productData = {
        productname: values.productname,
        productprice: values.productprice,
        productrank: values.productrank,
        producttype: values.producttype,
        productdes: values.productdes,
        productimage: downloadURL
      };

      const productRef = push(dbRef(db, 'products'));

      await set(productRef, productData);

      console.log('Product added successfully');
      makeItSpin(false)
      toast.success("Product added successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
      fetchData()
    } catch (error) {
      console.error('Error adding product:', error);
      makeItSpin(false)
      toast.error(error, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
    }
  };




  const frameworkComponents = {
    imageRenderer: (params) => (
      <img src={params.value} alt="Product" style={{ width: "100px" }} />
    ),
  };



  const deleteProduct = async (productId) => {
    try {
      await remove(ref(db, `products/${productId}`));
      toast.success("Product deleted successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
      fetchData()
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(error.message || "Failed to delete product", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
    }
  };
  const onCellValueChanged = async (params) => {
    try {
      const { id } = params.data;

      // Fetch the existing data from Firebase
      const snapshot = await get(ref(db, `products/${id}`));
      const existingData = snapshot.val();

      // Merge the updated field with the existing data
      const updates = {
        ...existingData,
        [params.colDef.field]: params.newValue
      };

      // Update the product data in Firebase
      await set(ref(db, `products/${id}`), updates);


      toast.success("Product updated successfully", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
      fetchData()
      setaddproduct(false)
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(error.message || "Failed to update product", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
    }
  };



  const [rowData, setRowData] = useState([]);
  // Column Definitions: Defines & controls grid columns.
  const colDefs = [
    { headerName: "Product Name", field: "productname", editable: true, filter: true },
    { headerName: "Product Price", field: "productprice", editable: true, filter: true },
    { headerName: "Product Rank", field: "productrank", editable: true, filter: true },
    { headerName: "Product Type", field: "producttype", editable: true, filter: true },
    { headerName: "Product Description", field: "productdes", editable: true, filter: true },

    {
      headerName: "Actions",
      cellRenderer: (params) => {
        const handleDelete = () => {
          deleteProduct(params.data.id);

        };
        return (
          <div>
            <button className=' bg-red-600 rounded-lg text-white' onClick={handleDelete}>Delete</button>
          </div>
        );
      }
    }

    ,

    {
      headerName: "Product Image",
      field: "productimage",
      cellRenderer: ({ value }) => <span dangerouslySetInnerHTML={{ __html: `<img src="${value}" style="width: 100px;height:100%" />` }} />
    },


  ];
  const defaultColDef = {
    flex: 1,
    minWidth: 100,
    getRowHeight: () => "500px", // Set the height to 150px
  };
  // Function to fetch data from Firebase and set it to rowData state
  const fetchData = async () => {
    try {
      const snapshot = await get(ref(db, 'products'));
      if (snapshot.exists()) {
        const data = snapshot.val();

        const dataArray = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setRowData(dataArray);
      } else {
        setRowData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Fetch data from Firebase on component mount
  useEffect(() => {
    fetchData();
  }, []);
  const gridRef = useRef();
  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  return (
    <div>
      <div className='flex flex-row justify-between px-3 mt-3'>
        <div>
          <h1>Products</h1>
        </div>
        <div>
          <button className='bg-black text-white p-3 rounded-lg me-3' onClick={onBtnExport}>
            Export
          </button>
          <button className='bg-black text-white p-3 rounded-lg' onClick={() => setaddproduct(true)}>
            Add Product
          </button>
        </div>
      </div>




      <div>
        <div className='ag-theme-quartz m-5' style={{ height: "80vh" }}>
          <AgGridReact ref={gridRef} rowData={rowData} columnDefs={colDefs} defaultColDef={defaultColDef} onCellValueChanged={onCellValueChanged} getRowHeight={() => 120} />
        </div>
      </div>





      <div>
        {addproduct && (

          <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

            <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

            <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
              <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                      <div className='container'>


                        <h1 className='font-bold mb-3 text-3xl font-bold'>Add Admin</h1>


                        <div className='flex flex-col gap-3'>
                          <div>
                            <label className='font-bold'>Product Name</label>
                            <input {...register("productname")} className='bg-gray-300 w-full p-2 rounded-lg mt-2 ' placeholder='Furnished' required />
                          </div>


                          <div>
                            <label className='font-bold'>Product Price</label>
                            <input {...register("productprice")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='1000' required />
                          </div>

                          <div>
                            <label className='font-bold'>Product Rank</label>
                            <input {...register("productrank")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='2' required />
                          </div>


                          <div>
                            <label className='font-bold'>Product Type</label>
                            <input {...register("producttype")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='Chair' required />
                          </div>

                          <div>
                            <label className='font-bold'>Product Description</label>
                            <input {...register("productdes")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='From Quality Buyers' required />
                          </div>


                          <div>
                            <label className='font-bold'>Product Image</label>
                            <input {...register("productimage")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='' type='file' required />
                          </div>

                        </div>

                      </div>
                    </div>
                    <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                      <button type="submit" class="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto">Add</button>
                      <button onClick={() => setaddproduct(false)} type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

        )
        }

      </div>
    </div>
  )
}

export default Products