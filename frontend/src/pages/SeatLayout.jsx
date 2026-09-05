import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { assets } from '../assets/assets'
import Loading from '../components/Loading'
import { ArrowRightIcon, ClockIcon } from 'lucide-react'
import isoTimeFormat from '../lib/isoTimeFormat'
import toast from 'react-hot-toast'
import { useAppContext } from '../context/AppContext'

const SeatLayout = () => {
  const groupRows = [
    ['A', 'B'],
    ['C', 'D'],
    ['E', 'F'],
    ['G', 'H'],
    ['I', 'J']
  ]

  const { axios, getToken, user } = useAppContext()
  const navigate = useNavigate()
  const { id, date } = useParams()
  const [selectedSeats, setSelectedSeats] = useState([])
  const [selectedTime, setSelectedTime] = useState(null)
  const [show, setShow] = useState(null)
  const [occupiedSeats, setOccupiedSeats] = useState([])

  const getShow = async () => {
    try {
      const { data } = await axios.get(`/api/show/${id}`)
      if (data.success) {
        setShow(data)
      }
    } catch (error) {
      console.log(error)
    }
  }

  const handleSeatSelect = (seatId) => {
    if (!selectedTime) {
      return toast('Please select time first')
    }

    if (!selectedSeats.includes(seatId) && selectedSeats.length >= 5) {
      return toast('You can select only 5 seats')
    }

    if (occupiedSeats.includes(seatId)) {
      return toast('This seat is already occupied')
    }

    setSelectedSeats(prev =>
      prev.includes(seatId)
        ? prev.filter(seat => seat !== seatId)
        : [...prev, seatId]
    )
  }

  const getOccupiedSeats = async () => {
    try {
      const { data } = await axios.get(`/api/booking/seats/${selectedTime.showId}`)
      if (data.success) {
        setOccupiedSeats(data.occupiedSeats)
      } else {
        toast.error(data.message)
      }
    } catch (error) {
      console.log('OCCUPIED SEATS ERROR:', error)
    }
  }

  const bookTickets = async () => {
    try {
      if (!user) {
        return toast.error('Please login to proceed')
      }

      if (!selectedTime) {
        return toast.error('Please select a time')
      }

      if (!selectedSeats.length) {
        return toast.error('Please select seats')
      }

      const { data } = await axios.post(
        '/api/booking/create',
        {
          showId: selectedTime.showId,
          selectedSeats
        },
        {
          headers: {
            Authorization: `Bearer ${await getToken()}`
          }
        }
      )

      if (!data.success) {
        return toast.error(data.message)
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.order.amount,
        currency: data.order.currency,
        name: 'QuickShow',
        description: show.movie.title,
        order_id: data.order.id,
        prefill: {
          name: user.fullName || '',
          email: user.primaryEmailAddress?.emailAddress || ''
        },
        theme: {
          color: '#F84464'
        },
        handler: async (response) => {
          try {
            const { data: verifyData } = await axios.post(
              '/api/booking/verify-payment',
              {
                ...response,
                bookingId: data.bookingId
              },
              {
                headers: {
                  Authorization: `Bearer ${await getToken()}`
                }
              }
            )

            if (verifyData.success) {
              toast.success('Payment successful')
              navigate('/my-bookings')
            } else {
              toast.error(verifyData.message)
            }
          } catch (error) {
            toast.error(error.response?.data?.message || error.message)
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled')
          }
        }
      }

      if (typeof window.Razorpay !== 'function') {
        return toast.error('Razorpay Checkout failed to load')
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (selectedTime) {
      setSelectedSeats([])
      setOccupiedSeats([])
      getOccupiedSeats()
    }
  }, [selectedTime])

  useEffect(() => {
    getShow()
  }, [id])

  const renderSeats = (row, count = 9) => (
    <div key={row} className="flex gap-2 mt-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: count }, (_, i) => {
          const seatId = `${row}${i + 1}`

          return (
            <button
              key={seatId}
              disabled={occupiedSeats.includes(seatId)}
              onClick={() => handleSeatSelect(seatId)}
              className={`h-8 w-8 rounded border border-primary/60 cursor-pointer transition ${occupiedSeats.includes(seatId)
                  ? 'bg-primary text-white opacity-50 cursor-not-allowed'
                  : 'hover:bg-primary/20'
                }`}
            >
              {seatId}
            </button>
          )
        })}
      </div>
    </div>
  )

  return show ? (
    <div className="flex flex-col md:flex-row px-6 md:px-40 lg:px-40 py-30 md:pt-50">
      <div className="w-60 bg-primary/10 border border-primary/20 rounded-lg py-10 h-max md:sticky md:top-30">
        <p className="text-lg font-semibold px-6">Available Timings</p>
        <div className="mt-5 space-y-1">
          {show?.dateTime?.[date]?.map(item => (
            <div
              key={item.showId}
              onClick={() => setSelectedTime(item)}
              className={`flex items-center gap-2 px-6 py-2 w-max rounded-r-md cursor-pointer transition ${selectedTime?.showId === item.showId
                  ? 'bg-primary text-white'
                  : 'hover:bg-primary/20'
                }`}
            >
              <ClockIcon className="w-4 h-4" />
              <p className="text-sm">{isoTimeFormat(item.time)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="relative flex-1 flex flex-col items-center max-md:mt-16">
        <h1 className="text-2xl font-semibold mb-4">Select Your Seat</h1>
        <img src={assets.screenImage} alt="Cinema Screen" />
        <p className="text-gray-400 text-sm mb-6">SCREEN SIDE</p>

        <div className="flex flex-col items-center mt-10 text-xs text-gray-300">
          <div className="grid grid-cols-2 md:grid-cols-1 gap-8 md:gap-2 mb-6">
            {groupRows[0].map(row => renderSeats(row))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-11">
          {groupRows.slice(1).map((group, idx) => (
            <div key={idx}>
              {group.map(row => renderSeats(row))}
            </div>
          ))}
        </div>

        {selectedSeats.length > 0 && (
          <p className="mt-6 text-sm text-gray-400">
            Selected Seats:{' '}
            <span className="text-white">{selectedSeats.join(', ')}</span>
          </p>
        )}

        <button
          onClick={bookTickets}
          className="flex items-center gap-1 mt-20 px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer active:scale-95"
        >
          Proceed To Checkout
          <ArrowRightIcon strokeWidth={3} className="w-4 h-4" />
        </button>
      </div>
    </div>
  ) : (
    <Loading />
  )
}

export default SeatLayout