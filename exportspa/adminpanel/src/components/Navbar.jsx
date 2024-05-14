import React from 'react'
import { auth } from '../config/firebase'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Cookies from 'js-cookie'
import { createUserWithEmailAndPassword } from 'firebase/auth'

const Navbar = ({makeItSpin}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname

  const Logout = () => {
    navigate('/signin')
    Cookies.remove('malar_admin_token')
    auth.signOut()
    toast.success('Logout Successful', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      draggable: true,
      theme: "dark",
    });
  }








  return (
    <div className='flex flex-col h-screen px-3 bg-black text-gray-300 w-64'>
      <div className='flex flex-col gap-4'>
        <div className='mt-5'>
          <h1 className='text-white font-bold text-2xl text-center'>SPA Admin Panel</h1>
        </div>


        <div className='mt-20 flex flex-col gap-8'>
    


          <Link to='/products'>
            <div className={pathname === '/products' ? 'flex gap-2 text-black bg-white p-3 rounded-lg' : 'flex gap-2 text-white bg-black p-3 rounded-lg'}>
              <span class="material-symbols-outlined">
                inventory_2
              </span>
              <h1 className='text-xl font-bold'>Products</h1>
            </div>
          </Link>



          <Link to='/customers'>
            <div className={pathname === '/customers' ? 'flex gap-2 text-black bg-white p-3 rounded-lg' : 'flex gap-2 text-white bg-black p-3 rounded-lg'}>
              <span class="material-symbols-outlined">
                groups_2
              </span>
              <h1 className='text-xl font-bold'>Customers</h1>
            </div>
          </Link>


          <Link to='/admins'>
            <div className={pathname === '/admins' ? 'flex gap-2 text-black bg-white p-3 rounded-lg' : 'flex gap-2 text-white bg-black p-3 rounded-lg'}>
              <span class="material-symbols-outlined">
                shield_person
              </span>
              <h1 className='text-xl font-bold'>Admins</h1>
            </div>
          </Link>
          <Link to='/orders'>
            <div className={pathname === '/orders' ? 'flex gap-2 text-black bg-white p-3 rounded-lg' : 'flex gap-2 text-white bg-black p-3 rounded-lg'}>
              <span class="material-symbols-outlined">
               orders
              </span>
              <h1 className='text-xl font-bold'>Orders</h1>
            </div>
          </Link>

        </div>




      </div>


      <div className='mt-auto'>
        <div onClick={Logout} className={`cursor-pointer mb-5 flex items-center   h-10 text-white rounded-lg transition-colors duration-150 ease-in-out focus:outline-none focus:shadow-outline`}>
          <span className="material-symbols-outlined">
            logout
          </span>
          <span className="ml-2 duration-300 ease-in-out">Logout</span>
        </div>
      </div>


    </div>
  )
}

export default Navbar