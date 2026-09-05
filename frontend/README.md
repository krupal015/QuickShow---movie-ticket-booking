# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


import { useState } from "react";
import { useContext } from "react";
import { createContext } from "react";
import axios from 'axios'
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useEffect } from "react";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL

export const AppContext = createContext()

export const AppProvider = ({ childern }) => {

    const [isAdmin, setIsAdmin] = useState(false)
    const [shows, setShows] = useState([])
    const [favoriteMOvies, setFavoriteMOvies] = useState([])

    const {user} = useUser()
    const { getToken } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const fetchIsAdmin = async () => {
        try {
            const { data } = await axios.get('/api/admin/is-admin', { headers: { Authorization: `Bearer ${await getToken()}` } })
            setIsAdmin(data.isAdmin)

            if (!data.isAdmin && location.pathname.startsWith('/admin')) {
                navigate('/')
                toast.error('you are not authorized to access admin dashboard')
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchShows = async () => {
        try {
            const { data } = await axios.get('/api/show/all')
            if (data.success) {
                setShows(data.shows)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    const fetchFavoriteMovies = async () => {
        try {
            const { data } = await axios.get('/api/user/favorites', { headers: { Authorization: `Bearer ${await getToken()}` } })
            if (data.success) {
                setFavoriteMOvies(data.movies)
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        if (user) {
            fetchShows()
        }
    }, [user])

    useEffect(() => {
        if (user) {
            fetchIsAdmin()
            fetchFavoriteMovies()
        }
    }, [user])

    const value = {
        axios,
        fetchIsAdmin,
        user,
        getToken,
        navigate,
        isAdmin,
        shows,
        favoriteMOvies,
        fetchFavoriteMovies
    }
    return (
        <AppContext.Provider value={value}>
            {childern}
        </AppContext.Provider>
    )
}

export const useAppContext = () => useContext(AppContext)