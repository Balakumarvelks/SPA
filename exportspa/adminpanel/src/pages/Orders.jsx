import { createUserWithEmailAndPassword } from 'firebase/auth'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { auth, db } from '../config/firebase'
import { toast } from 'react-toastify'
import { get, ref, set, update } from 'firebase/database'

import { AgGridReact } from 'ag-grid-react'


const Orders = ({ makeItSpin }) => {

  const [rowData, setRowData] = useState([]);


  const [colDefs, setColDefs] = useState([
    { headerName: "Date", field: "date", filter: true },
    { headerName: "Status", field: "status", filter: true, editable: true },
    { headerName: "User ID", field: "uid", filter: true, },
    { headerName: "Payment Method", field: "paymentMethod", filter: true, }

  ])

  // Function to fetch data from Firebase and set it to rowData state
  const fetchData = async () => {
    try {
      const snapshot = await get(ref(db, 'orders'));
      if (snapshot.exists()) {
        const data = snapshot.val();
        const dataArray = Object.keys(data).map(orderId => ({ id: orderId, orderId, ...data[orderId] }));
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

  const { handleSubmit, register } = useForm()

  const [addadmin, setaddadmin] = useState(false)



  function writeUserData(userid, email, password) {

    set(ref(db, 'admins/' + userid), {
      email: email,
      password: password
    });
    console.log('success')
  }



  const gridRef = useRef();
  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  const onCellValueChanged = async (params) => {
    try {
      const { id, status, orderId } = params.data;

      // Update the order status in Firebase
      if (params.colDef.field === 'status' && orderId) {
        await updateOrderStatus(orderId, status);

        // Update the rowData state to reflect the changes
        setRowData(prevRowData => {
          return prevRowData.map(row => {
            if (row.id === id) {
              return { ...row, [params.colDef.field]: params.newValue };
            }
            return row;
          });
        });

        toast.success("Order status updated successfully", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          draggable: true,
          theme: "dark",
        });
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error(error.message || "Failed to update order status", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
    }
  };


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      // Update the order status in Firebase
      const orderRef = ref(db, `orders/${orderId}`);
      await update(orderRef, { status: newStatus });

      console.log('Order status updated successfully.');
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };



  return (
    <div>
      <div className='flex flex-row justify-between px-3 mt-3'>
        <div>
          <h1>Orders</h1>
        </div>
        <div>
          <button className='bg-black text-white p-3 rounded-lg me-3' onClick={onBtnExport}>
            Export
          </button>

        </div>
      </div>


      <div>
        <div className='ag-theme-quartz m-5' style={{ height: "80vh" }}>
          <AgGridReact rowData={rowData} columnDefs={colDefs} ref={gridRef} onCellValueChanged={onCellValueChanged} />
        </div>
      </div>








    </div>
  )
}

export default Orders