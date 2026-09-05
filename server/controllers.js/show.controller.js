import axios from "axios"
import Movie from "../models/movies.models.js"
import Show from "../models/show.models.js"

// api to get movies from TMDB API
export const getNowPlayingMovies = async (req, res) => {
    try {
        // await axios.get('https://api.themoviedb.org/3/movie/now_playing',{
        //     Headers :{Authorization : `Bearer ${process.env.TMDB_API_KEY}`}
        // })

        const { data } = await axios.get(
            'https://api.themoviedb.org/3/movie/now_playing',
            {
                headers: {
                    Authorization: `Bearer ${process.env.READ_ACCESS_TOKEN}`,
                    accept: 'application/json'
                }
            }
        )

        const movies = data.results
        res.json({ success: true, movies: movies })

    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API  to add new show to database4
export const addShow = async (req, res) => {
    try {
        const { movieId, showsInput, showPrice } = req.body

        let movie = await Movie.findById(movieId)

        if (!movie) {
            // fetching movie details and credits from TMDb api
            const [movieDetailsResponse, movieCreditresponse] = await Promise.all([
                axios.get(`https://api.themoviedb.org/3/movie/${movieId}`, {
                    headers: {
                        Authorization: `Bearer ${process.env.READ_ACCESS_TOKEN}`,
                        accept: 'application/json'
                    }
                }),

                axios.get(`https://api.themoviedb.org/3/movie/${movieId}/credits`, {
                    headers: {
                        Authorization: `Bearer ${process.env.READ_ACCESS_TOKEN}`,
                        accept: 'application/json'
                    }
                })
            ])

            const movieApiData = movieDetailsResponse.data;
            const movieCreaditData = movieCreditresponse.data;

            console.log("TMDB CREDIT DATA:", movieCreaditData);
            console.log("TMDB CAST:", movieCreaditData.cast);

            const movieDetails = {
                _id: movieId,
                title: movieApiData.title,
                overview: movieApiData.overview,
                poster_path: movieApiData.poster_path,
                backdrop_path: movieApiData.backdrop_path,
                release_date: movieApiData.release_date,
                original_language: movieApiData.original_language,
                tagline: movieApiData.tagline || "",
                genres: movieApiData.genres,
                casts: movieCreaditData.cast,
                vote_average: movieApiData.vote_average,
                runtime: movieApiData.runtime,
            }

            console.log(movieDetails.casts)
            // adding movie to database  
            movie = await Movie.create(movieDetails)
        }

        // const showToCreate = [];
        // showInput.forEach(show => {
        //     const showDate = show.date;
        //     show.time.forEach((time) =>{
        //         const dateTimeString = `${showDate}T${time}`;
        //         showToCreate.push({
        //             movie:movieId,
        //             showdateTime : new Date(dateTimeString),
        //             showPrice,
        //             occupiedSeats:[]
        //         })
        //     })
        // });

        const showToCreate = [];

        showsInput.forEach(show => {
            const dateTimeString = `${show.date}T${show.time}`;

            showToCreate.push({
                movie: movieId,
                showDateTime: new Date(dateTimeString),
                showPrice,
                occupiedSeats: []
            });
        });

        if (showToCreate.length > 0) {
            await Show.insertMany(showToCreate)
        }
        res.json({ success: true, message: "show added successfully" })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// get all shows from the database 
export const getShows = async (req, res) => {
    try {
        const shows = await (Show.find({ showDateTime: { $gte: new Date() } }).populate('movie')).sort({ showDateTime: 1 });

        // console.log("SHOWS IN DATABASE:", shows);

        const uniqueShows = new Set(shows.map(show => show.movie))
        res.json({ success: true, shows: Array.from(uniqueShows) })
    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}

// API to get a single show from the database
export const getShow = async (req, res) => {
    try {
        const { movieId } = req.params;
        // get all upcoming shows for the movie
        const shows = await Show.find({
            movie: movieId, showDateTime: { $gte: new Date() }
        });

        const movie = await Movie.findById(movieId);
        const dateTime = {};

        shows.forEach((show) => {
            const date = show.showDateTime.toISOString().split("T")[0];

            if (!dateTime[date]) {
                dateTime[date] = [];
            }

            dateTime[date].push({ time: show.showDateTime, showId: show._id });
        });

        res.json({
            success: true,
            movie,
            dateTime
        });

    } catch (error) {
        console.error(error)
        res.json({ success: false, message: error.message })
    }
}