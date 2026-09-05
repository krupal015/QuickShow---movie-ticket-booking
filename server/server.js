// import express from 'express'
// import cors from 'cors'
// import 'dotenv/config'
// import connectDb from './config/db.js'
// import { clerkMiddleware } from '@clerk/express'
// import { serve } from 'inngest/express'
// import { inngest, functions } from './inngest/index.js'
// import showRouter from './routes/show.routes.js'
// import bookingRouter from './routes/booking.routes.js'
// import adminRouter from './routes/admin.routes.js'
// import userRouter from './routes/user.routes.js'

// const app = express()

// const port = 3000

// await connectDb()

// app.use(clerkMiddleware())
// app.use(cors())
// app.use(express.json())

// app.get('/', (req, res) => res.send('server is Live!'))
// app.use('/api/inngest',serve({client: inngest, functions, }))
// app.use('/api/show',showRouter)
// app.use('/api/booking',bookingRouter)
// app.use('/api/admin',adminRouter)
// app.use('/api/user',userRouter)

// app.listen(port, () =>console.log(`server is running on http://localhost:${port}`)
// )
 
// export default app

import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDb from './config/db.js'
import { clerkMiddleware, getAuth } from '@clerk/express'
import { serve } from 'inngest/express'
import { inngest, functions } from './inngest/index.js'
import showRouter from './routes/show.routes.js'
import bookingRouter from './routes/booking.routes.js'
import adminRouter from './routes/admin.routes.js'
import userRouter from './routes/user.routes.js'
import paymentRouter from './routes/payment.routes.js'
import { razorpayWebhooks } from './controllers.js/razorpayWebhook.controllers.js'

const app = express()
const port = 3000

await connectDb()

// razorpay route
app.use('/api/razorpay',express.raw({type:'application/json'}),razorpayWebhooks)

app.use(clerkMiddleware())
app.use(cors())
app.use(express.json())

app.get('/api/debug-auth', (req, res) => {
    const auth = getAuth(req)

    console.log('AUTHORIZATION HEADER EXISTS:', !!req.headers.authorization)
    console.log('IS AUTHENTICATED:', auth.isAuthenticated)
    console.log('USER ID:', auth.userId)

    res.json({
        authorizationHeader: !!req.headers.authorization,
        isAuthenticated: auth.isAuthenticated,
        userId: auth.userId
    })
})

app.get('/', (req, res) => res.send('server is Live!'))

app.use('/api/inngest', serve({ client: inngest, functions }))

app.use('/api/show', showRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/admin', adminRouter)
app.use('/api/user', userRouter)
app.use('/api/payment', paymentRouter)

app.listen(port, () => console.log(`server is running on http://localhost:${port}`))

export default app