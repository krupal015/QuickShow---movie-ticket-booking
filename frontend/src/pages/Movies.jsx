import React from 'react'
import MovieCard from '../components/MovieCard'
import { useAppContext } from '../context/AppContext'

const Movies = () => {
  const {shows} = useAppContext()
  return  shows.length > 0 ? (
    <div className='relative my-40 mb-60 px-6 md:px-16 lg:px-40 xl:px-44 overflow-hidden min-h-[80vh]' >
      <h1 className='text-lg font-medium my-4'>Now Showing</h1>
      <div className='flex flex-wrap flex-row gap-5'>
        {shows.map((movie)=> (
          <MovieCard movie={movie} key={movie._id}/>
        ))}
      </div>
    </div>
  ) : (
    <div>
      <h1 className='text-3xl font-bold text-center'>No Movie available</h1>
    </div>
  )
}

export default Movies
