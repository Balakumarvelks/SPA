import React, { useEffect, useState } from 'react'
import { auth, db } from '../config/firebase'
import { sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import { toast } from 'react-toastify'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import Cookies from 'js-cookie'
import { get, ref } from 'firebase/database'
import Cart from '../pages/Cart'

const Navbar = ({ makeItSpin }) => {


    const { handleSubmit, register } = useForm()
    const [forgotPassword, setforgotPassword] = useState(false)

    const [login, setlogin] = useState(false)



    useEffect(() => {
        const cookie = Cookies.get('malar_client_uid');
        if (cookie) {
            setlogin(true);
        } else {
            setlogin(false);
        }
    }, []);





    const sendPasswordResetMail = async (values) => {

        makeItSpin(true);
        sendPasswordResetEmail(auth, values.passwordresetemail)
            .then(() => {
                toast.success('Password reset Email Sent Successfully kindly check your inbox', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    draggable: true,
                    theme: "dark",
                });
                makeItSpin(false);
            })
            .catch((error) => {

                makeItSpin(false);
                toast.error('Check your Email Again', {
                    position: "top-center",
                    autoClose: 5000,
                    hideProgressBar: false,
                    closeOnClick: true,

                    draggable: true,
                    theme: "dark",
                });
            });
    };

    const navigate = useNavigate()



    const logout = () => {
        auth.signOut()
        Cookies.remove('malar_client_uid')
        setlogin(false)
        navigate('/')
    }
    return (
        <div>


            <div className='flex justify-between px-4 pt-4 mb-5'>
                <div type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample" aria-controls="offcanvasExample">
                    <span class="material-symbols-outlined  text-6xl">
                        segment
                    </span>
                </div>

                <h1 className='font-bold text-3xl pt-3'>SPA</h1>
                <div type='button' data-bs-toggle="offcanvas" data-bs-target="#offcanvasExample2" aria-controls="offcanvasExample2">
                    <span class="material-symbols-outlined  text-6xl">
                        local_mall
                    </span>
                </div>
            </div>






            <div class="offcanvas offcanvas-start bg-black" tabindex="-1" id="offcanvasExample" aria-labelledby="offcanvasExampleLabel">
                <div class="offcanvas-body">
                    <div className='flex flex-col gap-5 fw-bold text-5xl'>
                        <div className='flex justify-end'>
                            <h1 className='' type="button" data-bs-dismiss="offcanvas"><span class="material-symbols-outlined">
                                cancel
                            </span>
                            </h1>
                        </div>
                        {login && (
                            <div className='flex flex-col gap-4'>
                                <Link to='/' >
                                    <h1 data-bs-dismiss="offcanvas">PRODUCTS</h1>
                                </Link>
                                <Link to='/orders'>
                                    <h1 data-bs-dismiss="offcanvas">ORDERS</h1>
                                </Link>
                                {/* <Link to='/profile'>
                                    <h1 data-bs-dismiss="offcanvas">PROFILE</h1>
                                </Link> */}

                                <h1 className='cursor-pointer' onClick={() => logout()}>SIGN OUT</h1>

                            </div>
                        )}
                    </div>




                    {!login && (
                        <div className='flex flex-col gap-5 fw-bold text-5xl'>
                            <h1 type='button' onClick={() => navigate('/signin')} aria-controls="offcanvasExample3">LOGIN</h1>
                            <h1 type='button' onClick={() => navigate('/signup')}>REGISTER</h1>
                        </div>
                    )}

                </div>
            </div>



            <div class="offcanvas offcanvas-end bg-black" tabindex="-1" id="offcanvasExample2" aria-labelledby="offcanvasExampleLabel2">


                <div class="offcanvas-body">
                    <div className='flex flex-row justify-between'>
                        <h1 className='fw-bold text-5xl'>CART</h1>
                        <h1 className='' type="button" data-bs-dismiss="offcanvas"><span class="material-symbols-outlined">
                            cancel
                        </span>
                        </h1>
                    </div>


                    <div className='flex flex-col gap-3'>
                        <Cart />

                    </div>
                </div>
            </div>




            <div class="offcanvas offcanvas-start bg-black" tabindex="-1" id="offcanvasExample3" aria-labelledby="offcanvasExampleLabel3">
                <div class="offcanvas-body">
                    <div className='flex flex-col gap-5 fw-bold text-5xl'>
                        <div className='flex justify-end'>
                            <h1 className='' type="button" data-bs-dismiss="offcanvas"><span class="material-symbols-outlined">
                                cancel
                            </span>
                            </h1>
                        </div>





                        {forgotPassword && (

                            <div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">

                                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

                                <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
                                    <div class="flex min-h-full items-center justify-center p-4 text-center sm:items-center sm:p-0">

                                        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                                            <form onSubmit={handleSubmit(sendPasswordResetMail)}>
                                                <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                                                    <div className='container'>


                                                        <label className='font-bold'>Forgot Password ?</label>
                                                        <input {...register("passwordresetemail")} className='bg-gray-300 w-full p-2 rounded-lg mt-2' placeholder='Enter your Email' required />


                                                    </div>
                                                </div>
                                                <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                                                    <button type="submit" class="inline-flex w-full justify-center rounded-md bg-black px-3 py-2 text-sm font-semibold text-white shadow-sm sm:ml-3 sm:w-auto">Send Password Reset Link</button>
                                                    <button onClick={() => setforgotPassword(false)} type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto">Cancel</button>
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
            </div>






        </div>
    )
}

export default Navbar