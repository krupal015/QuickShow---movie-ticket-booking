import crypto from "crypto";
import Booking from "../models/booking.models.js";
import { inngest } from "../inngest/index.js";

console.log("INNGEST IMPORT:", inngest);

export const razorpayWebhooks = async (req, res) => {
    try {
        const signature = req.headers["x-razorpay-signature"];
        const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

        if (!signature || !webhookSecret) {
            return res.status(400).json({
                success: false,
                message: "Missing webhook signature or secret"
            });
        }

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (expectedSignature !== signature) {
            return res.status(400).json({
                success: false,
                message: "Invalid webhook signature"
            });
        }

        const event = JSON.parse(req.body.toString());

        switch (event.event) {
            case "payment.captured": {
                const payment = event.payload.payment.entity;

                const razorpayOrderId = payment.order_id;

                const booking = await Booking.findOne({
                    razorpayOrderId
                });

                if (!booking) {
                    console.log(
                        "Booking not found for Razorpay order:",
                        razorpayOrderId
                    );
                    break;
                }

                await Booking.findByIdAndUpdate(booking._id, {
                    isPaid: true,
                    paymentLink: ""
                });

                // send confirmation email

                await inngest.send({
                    name: "app/show.booked",
                    data: {
                        bookingId: booking._id.toString()
                    }
                })

                console.log("Booking marked as paid:", booking._id);

                break;
            }

            case "payment.failed": {
                const payment = event.payload.payment.entity;

                console.log(
                    "Razorpay payment failed:",
                    payment.id,
                    payment.error_description
                );

                break;
            }

            case "order.paid": {
                console.log("Razorpay order paid:", event.payload.order.entity.id);
                break;
            }

            default:
                console.log("Unhandled Razorpay event:", event.event);
        }

        return res.json({ received: true });

    } catch (error) {
        console.error("Razorpay webhook error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
};