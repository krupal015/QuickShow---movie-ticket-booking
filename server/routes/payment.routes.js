import express from 'express'

const paymentRouter = express.Router()

paymentRouter.get('/test', (req, res) => {
    res.json({ success: true, message: 'Razorpay route is working' })
})

export default paymentRouter