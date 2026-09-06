import Booking from "../models/booking.models.js";
import Show from "../models/show.models.js"
import razorpayInstance from '../config/razorpay.js'

// function to check availability os selected seats for the movie
export const checkSeatAvailability = async (showId, selectedSeats) => {
    try {
        const showData = await Show.findById(showId)
        if (!showData) return false;

        const occupiedSeats = showData.occupiedSeats;

        const isAnySeattaken = selectedSeats.some(seat => occupiedSeats[seat])

        return !isAnySeattaken
    } catch (error) {
        console.log(error.message);
        return false;

    }
}

// export const createBooking = async (req, res) => {
//     try {
//         const { userId } = req.auth();
//         const { showId, selectedSeats } = req.body;

//         const isAvailable = await checkSeatAvailability(showId, selectedSeats);

//         if (!isAvailable) {
//             return res.json({
//                 success: false,
//                 message: "Selected seats are not available"
//             });
//         }

//         const showData = await Show.findById(showId).populate('movie');

//         const booking = await Booking.create({
//             user: userId,
//             show: showId,
//             amount: showData.showPrice * selectedSeats.length,
//             bookedSeats: selectedSeats
//         });

//         if (!showData.occupiedSeats || Array.isArray(showData.occupiedSeats)) {
//             showData.occupiedSeats = {}
//         }

//         selectedSeats.forEach((seat) => {
//             showData.occupiedSeats[seat] = userId
//         })
//         showData.markModified('occupiedSeats');

//         await showData.save();

//         // razorpay payment gateway

//         const razorpayInstance = new razorpay(process.env.RAZORPAY_SECRET_KEY)

//         // creating line items for razorpay

//         const bookingAmount = showData.showPrice * selectedSeats.length;

//         const options = {
//             amount: Math.floor(bookingamount) * 100,
//             currency: 'INR',
//             receipt: `booking_${booking._id}`
//         }

//         const order = await razorpayInstance.orders.create(options)

//         booking.paymentLink = order.id
//         await booking.save()

//         res.json({
//             success: true,
//             order,
//              bookingId: booking._id
//         });

//     } catch (error) {
//         console.log(error.message);
//         res.json({
//             success: false,
//             message: error.message
//         });
//     }
// };

export const createBooking = async (req, res) => {
    try {
        const { userId } = req.auth();
        const { showId, selectedSeats } = req.body;

        const isAvailable = await checkSeatAvailability(showId, selectedSeats);

        if (!isAvailable) {
            return res.json({
                success: false,
                message: "Selected seats are not available"
            });
        }

        const showData = await Show.findById(showId).populate("movie");

        if (!showData) {
            return res.json({
                success: false,
                message: "Show not found"
            });
        }

        const bookingAmount = showData.showPrice * selectedSeats.length;

        const booking = await Booking.create({
            user: userId,
            show: showId,
            amount: bookingAmount,
            bookedSeats: selectedSeats
        });

        const options = {
            amount: Math.floor(bookingAmount * 100),
            currency: "INR",
            receipt: `booking_${booking._id}`
        };

        const order = await razorpayInstance.orders.create(options);

        booking.razorpayOrderId = order.id
        await booking.save()

        // Run Inngest Scheduler Function to check payment status after 10 minutes
        await inngest.send({
            name: "app/checkpayment",
            data: {
                bookingId: booking._id.toString()
            }
        })

        res.json({
            success: true,
            order,
            bookingId: booking._id
        });

    } catch (error) {
        console.log(error.message);

        res.json({
            success: false,
            message: error.message
        });
    }
};

export const getOccupiedSeats = async (req, res) => {
    try {

        const { showId } = req.params;
        const showData = await Show.findById(showId)

        const occupiedSeats = Object.keys(showData.occupiedSeats)

        res.json({ success: true, occupiedSeats })
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message })
    }
}