import React, { useState } from 'react'
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Orders from './pages/Orders'
import Profile from './pages/Profile'
import Cart from './pages/Cart'
import Navbar from './components/Navbar'
import Loader from './components/Loader'
import { ToastContainer } from 'react-toastify'
import Signin from './pages/Signin'
import SignUp from './pages/SignUp'

const App = () => {
  const [loader, setLoader] = useState(false)

  const makeItSpin = (spinvalue) => {
    setLoader(spinvalue)
  }



  const NavBarRoutes = ['/signup', '/signin'];
  const ConditionalNavBar = () => {
    const location = useLocation();
    const showNavBar = !NavBarRoutes.includes(location.pathname);
    return showNavBar ? <Navbar /> : null;
  };


  return (
    <div className='overflow-auto'>
      <BrowserRouter>
        <ConditionalNavBar />
        <Routes>
          <Route path='/' element={<Home makeItSpin={makeItSpin} />} />
          <Route path='/profile' element={<Profile makeItSpin={makeItSpin} />} />
          <Route path='/orders' element={<Orders makeItSpin={makeItSpin} />} />
          <Route path='/cart' element={<Cart makeItSpin={makeItSpin} />} />

          <Route path='/signin' element={<Signin makeItSpin={makeItSpin} />} />
          <Route path='/signup' element={<SignUp makeItSpin={makeItSpin} />} />

        </Routes>


        <Loader spinning={loader} />


        <ToastContainer limit={4} newestOnTop={true} />

      </BrowserRouter>
    </div>

  )
}

export default App