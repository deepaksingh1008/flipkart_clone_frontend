import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PriceSidebar from './PriceSidebar';
import Stepper from './Stepper';
import { useNavigate } from 'react-router-dom';
import { clearErrors } from '../../actions/orderAction';
import { useSnackbar } from 'notistack';
import MetaData from '../Layouts/MetaData';
import { newOrder } from '../../actions/orderAction';
import { emptyCart } from '../../actions/cartAction';

const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { enqueueSnackbar } = useSnackbar();
    const paymentBtn = useRef(null);

    const [payDisable, setPayDisable] = useState(false);

    const { shippingInfo, cartItems } = useSelector((state) => state.cart);
    const { user } = useSelector((state) => state.user);
    const { error } = useSelector((state) => state.newOrder);

    const totalPrice = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const paymentData = {
        amount: Math.round(totalPrice * 100), // Razorpay requires amount in paise
    };

    const order = {
        shippingInfo,
        orderItems: cartItems,
        totalPrice,
        user,
        orderStatus: 'Processing'
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setPayDisable(true);

        try {
            const config = {
                headers: {
                    "Content-Type": "application/json",
                },
            };

            const { data } = await axios.post('/api/v1/process', paymentData, config);
            console.log(data);

            const options = {
                key: data.key, // Enter the Key ID generated from the Dashboard
                amount: data.amount,
                currency: data.currency,
                name: "Flipkart",
                description: "Test Transaction",
                image: "/your_logo.png",
                order_id: data.id, // This is a sample Order ID. Pass the `id` obtained in the response of createOrder().
                handler: async function (response) {
                    console.log('Handler function executed with response:', response);
                    const result = await axios.post('/api/v1/verify', response);
                    console.log('result1', result)
                    if (result.data.success) {
                        console.log('result', result)
                        order.paymentInfo = {
                            id: result.data.payment._id,
                            status: result.data.status,
                        };
                        // order.paidAt={
                        //    paidAt:result.data.payment.createdAt;
                        // }

                        dispatch(newOrder(order));
                        dispatch(emptyCart());
                        console.log('result', result)
                        navigate("/order/success");
                    } else {
                        enqueueSnackbar("Payment verification failed", { variant: "error" });
                    }
                },
                prefill: {
                    name: user.name,
                    email: user.email,
                    contact: shippingInfo.phoneNo,
                },
                notes: {
                    address: shippingInfo.address,
                },
                theme: {
                    color: "#3399cc",
                },
            };

            const razorpay = new window.Razorpay(options);
            console.log(razorpay)
            razorpay.open();

            setPayDisable(false);

        } catch (error) {
            setPayDisable(false);
            enqueueSnackbar(error.response?.data?.message, { variant: "error" });
        }
    };

    useEffect(() => {
        if (error) {
            dispatch(clearErrors());
            enqueueSnackbar(error, { variant: "error" });
        }
    }, [dispatch, error, enqueueSnackbar]);

    return (
        <>
            <MetaData title="Flipkart: Secure Payment" />

            <main className="w-full mt-20">
                <div className="flex flex-col sm:flex-row gap-3.5 w-full sm:w-11/12 mt-0 sm:mt-4 m-auto sm:mb-7">
                    <div className="flex-1">
                        <Stepper activeStep={3}>
                            <div className="w-full bg-white">
                                <form onSubmit={submitHandler} autoComplete="off" className="flex flex-col justify-start gap-3 w-full sm:w-3/4 mx-8 my-4">
                                    <input ref={paymentBtn} type="submit" value={`Pay ₹${totalPrice.toLocaleString()}`} disabled={payDisable} className={`${payDisable ? "bg-primary-grey cursor-not-allowed" : "bg-primary-orange cursor-pointer"} w-full sm:w-1/3 my-2 py-3.5 text-sm font-medium text-white shadow hover:shadow-lg rounded-sm uppercase outline-none`} />
                                </form>
                            </div>
                        </Stepper>
                    </div>
                    <PriceSidebar cartItems={cartItems} />
                </div>
            </main>
        </>
    );
};

export default Payment;
