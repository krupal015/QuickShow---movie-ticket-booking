import React from 'react'
import { assets } from '../assets/assets'
import { ArrowRight, CalendarIcon, ClockIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const HeroSection = () => {

    const navigate = useNavigate()

    return (
        <div
            className="flex flex-col text-white items-start justify-center gap-4 px-6 md:px-16 lg:px-36 bg-cover bg-center h-screen"
            style={{ backgroundImage: `url(${assets.Doomsday})` }}
        >

            <h1 className="text-5xl md:text-[70px] md:leading-18 font-semibold max-w-110">
                Avengers <br />
                Doomsday
            </h1>

            <div className="text-base font-semibold">
                <span>
                    Action | Adventure | Superhero
                </span>

                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4.5 h-4.5" />
                    2026
                </div>

                <div className="flex items-center gap-2">
                    <ClockIcon className="w-4.5 h-4.5" />
                    2h 30m
                </div>
            </div>

            <p className='h-40 w-100 max-w-md text-gray-300'>After the events of Multiverse of madness and No way Home the multiverse is hading towards the incursion ... so the Avengers are going to stop incursion and Doom will help them</p>
            <button onClick={()=> navigate('/movies')}
            className='flex items-center gap-1 px-6 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-full font-medium cursor-pointer'>Explore Movies <ArrowRight /> </button>
        </div>
    )
}

export default HeroSection