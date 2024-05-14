import { createUserWithEmailAndPassword } from 'firebase/auth'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { auth, db } from '../config/firebase'
import { toast } from 'react-toastify'
import { get, ref, set } from 'firebase/database'

import { AgGridReact } from 'ag-grid-react'


const Customers = ({ makeItSpin }) => {

  const [rowData, setRowData] = useState([]);
  // Column Definitions: Defines & controls grid columns.
  const [colDefs, setColDefs] = useState([
    { headerName: "Name", field: "name", filter: true },
    { headerName: "Email", field: "email", filter: true },
    { headerName: "Address", field: "address", filter: true },
    { headerName: "Phone", field: "phone", filter: true },


  ])

  // Function to fetch data from Firebase and set it to rowData state
  const fetchData = async () => {
    try {
      const snapshot = await get(ref(db, 'customers'));
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

  const { handleSubmit, register } = useForm()

  const [addadmin, setaddadmin] = useState(false)



  function writeUserData(userid, email, password) {

    set(ref(db, 'admins/' + userid), {
      email: email,
      password: password
    });
    console.log('success')
  }


  const onSubmit = async (values) => {
    makeItSpin(true)
    console.log(values);

    try {
      const response = await createUserWithEmailAndPassword(auth, values.email, values.password);
      console.log(response);
      toast.success('Registeration Successful', {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        draggable: true,
        theme: "dark",
      });
      setaddadmin(false)
      console.log(response.user.uid)
      writeUserData(response.user.uid, values.email, values.password)
    } catch (error) {

      console.error(error.code);
      if (error.code === 'auth/email-already-in-use') {
        toast.error('User Already Exists', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,

          draggable: true,
          theme: "dark",
        });
      }
      else {
        toast.error('Email or Password is wrong', {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,

          draggable: true,
          theme: "dark",
        });
      }



    } finally {
      makeItSpin(false)
    }
  }
  const gridRef = useRef();
  const onBtnExport = useCallback(() => {
    gridRef.current.api.exportDataAsCsv();
  }, []);

  return (
    <div>
      <div className='flex flex-row justify-between px-3 mt-3'>
        <div>
          <h1>Customers</h1>
        </div>
        <div>
          <button className='bg-black text-white p-3 rounded-lg me-3' onClick={onBtnExport}>
            Export
          </button>

        </div>
      </div>


      <div>
        <div className='ag-theme-quartz m-5' style={{ height: "80vh" }}>
          <AgGridReact rowData={rowData} columnDefs={colDefs} ref={gridRef} />
        </div>
      </div>



      {addadmin && (

        <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

          <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

          <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
            <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

              <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div className='container'>


                      <h1 className='font-bold mb-3 text-3xl font-bold'>Add Customer</h1>


                      <div className='flex flex-col gap-3'>
                        <div>
                          <label className='font-bold'>Email</label>
                          <input type='email' {...register("email")} className='bg-gray-300 w-full p-2 rounded-lg mt-2 ' placeholder='Enter your Email' required />
                        </div>


                        <div>
                          <label className='font-bold'>Password</label>
                          <input type='password' {...register("password")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='Enter your Email' required />
                        </div>


                      </div>

                    </div>
                  </div>
                  <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="submit" class="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto">Add</button>
                    <button onClick={() => setaddadmin(false)} type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

      )
      }




    </div>
  )
}

export default Customers