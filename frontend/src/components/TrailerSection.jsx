import React, { useState } from 'react'
import { dummyTrailers } from '../assets/assets'
import Reactplayer from 'react-player'

const TrailerSection = () => {

    const [currentTrailer, setCurrentTrailer] = useState(dummyTrailers[0])
    return (
        <div className='px-6 md:px-16 lg:px-24 xl:px-44 py-20 overflow-hidden'>
            <p className='text-gray-300 font-medium text-lg max-w-240 mx-auto'
            >Trailers</p>
            <div>
                <Reactplayer src={currentTrailer.videoUrl}
                    controls={false}
                    className='mx-auto max-w-full'
                    width='960px' height='540px'
                />
            </div>

            <div className='group grid grid-cols-4 gap-4 md:gap-8 mt-8 max-w-3xl mx-auto'>
                {dummyTrailers.map((trailer)=> (
                    <div key={trailer.image}
                    onClick={()=>setCurrentTrailer(trailer)}
                    className='relative group-hover:not-hover:opacity-50 hover:-translate-y-1 duration-300 transition cursor-pointer max-md:h-60 ms:max-h-60'>
                        <img src={trailer.image} alt="trailers"
                        className='rounded-lg w-full h-full object-cover brightness-75' />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TrailerSection
