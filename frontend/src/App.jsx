import React from 'react'
import Navbar from './components/Navbar'
import { Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Movies from './pages/Movies'
import MovieDetails from './pages/MovieDetails'
import SeatLayout from './pages/SeatLayout'
import MyBookings from './pages/MyBookings'
import Favorite from './pages/Favorite'
import Footer from './components/Footer'
import { Toaster } from 'react-hot-toast'
import { AuthenticateWithRedirectCallback, SignIn } from "@clerk/clerk-react";
import Layout from './pages/Admin/Layout'
import DashBoard from './pages/Admin/DashBoard'
import AddShows from './pages/Admin/AddShows'
import ListShows from './pages/Admin/ListShows'
import ListBookings from './pages/Admin/ListBookings'
import { useAppContext } from './context/AppContext'
import Loading from './components/Loading'
const App = () => {

  const location = useLocation()

  const isAdmin = location.pathname.startsWith('/admin')

  const {user} = useAppContext()

  return (
    <>
      <Toaster />
      {!isAdmin && <Navbar />}
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/movies' element={<Movies />} />
        <Route path='/movies/:id' element={<MovieDetails />} />
        <Route path='/movies/:id/:date' element={<SeatLayout />} />
        <Route path='/my-bookings' element={<MyBookings />} />
        <Route path='/favorite' element={<Favorite />} />
        <Route path='/loading/:nexturl' element={<Loading />} />

        <Route path='/admin/*' element={user ? <Layout /> : (
          <div className='min-h-screen flex justify-center items-center'>
            <SignIn fallbackRedirectUrl={'/admin'} />
          </div>
        )}>
          <Route index element={<DashBoard />} />
          <Route path='add-shows' element={<AddShows />} />
          <Route path='list-shows' element={<ListShows />} />
          <Route path='list-bookings' element={<ListBookings />} />
        </Route>

      </Routes>

      {!isAdmin && <Footer />}

    </>
  )
}

export default App
