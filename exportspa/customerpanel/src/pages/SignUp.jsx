import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from 'firebase/auth'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { auth, db } from '../config/firebase'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import Cookies from 'js-cookie'
import { get, orderByChild, ref, set } from 'firebase/database'


const SignUp = ({ makeItSpin }) => {
    const { handleSubmit, register } = useForm()
    const [forgotPassword, setforgotPassword] = useState(false)

    const navigate = useNavigate()


    function writeUserData(userid, email, password, name, phone, address) {

        set(ref(db, 'customers/' + userid), {
            email: email,
            password: password,
            name: name,
            phone: phone,
            address: address,
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

            console.log(response.user.uid)
            writeUserData(response.user.uid, values.email, values.password, values.name, values.phone, values.address)
            navigate('/signin')
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





    return (
        <div className='flex flex-col justify-center items-center h-screen'>

            <div className='container lg:max-w-sm max-w-md '>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <h1 className='text-center text-5xl font-bold pb-4'>SPA</h1>
                    <div className='flex flex-col gap-4'>
                        <label className='font-bold'>Name</label>
                        <input {...register("name")} type='text' className='bg-neutral-300  p-3 rounded-lg' placeholder='Enter your Name' required />
                        <label className='font-bold'>Email</label>
                        <input {...register("email")} type='email' className='bg-neutral-300  p-3 rounded-lg' placeholder='Enter your Email' required />
                        <label className='font-bold'>Password</label>
                        <input {...register("password")} type='password' className='bg-neutral-300  p-3 rounded-lg' placeholder='Enter your Password' required />
                        <label className='font-bold'>Phone</label>
                        <input {...register("phone")} type='number' className='bg-neutral-300  p-3 rounded-lg' placeholder='Enter your Phone' required />

                        <label className='font-bold'>Address</label>
                        <textarea {...register("address")} type='text' className='bg-neutral-300  p-3 rounded-lg' placeholder='Enter your Address' required />


                        <button className='rounded-lg  p-3 bg-black text-white font-bold'>
                            Sign Up
                        </button>


                        <p className='text-center font-bold cursor-pointer'>Already have an account ? <span onClick={() => navigate('/signin')}>
                            Sign In
                        </span> </p>
                    </div>
                </form>
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




        </div >
    )
}

export default SignUp