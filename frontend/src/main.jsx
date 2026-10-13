import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './app/store.js'
import './index.css'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import AuthLayout from "./layouts/AuthLayout.jsx"
import MainLayout from './layouts/MainLayout.jsx'
import Register from './pages/Register.jsx'
import Login from './pages/Login.jsx'
import Home from './pages/Home.jsx'
import Watch from './pages/Watch.jsx'
import VideoHistory from "./pages/VideoHistory.jsx"
import LikedVideo from "./pages/LikedVideo.jsx"
import UserDashboard from "./pages/UserDashboard.jsx"
import Playlist from './pages/Playlist.jsx'
import Subscriptions from './pages/Subscriptions.jsx'
import ChannelProfile from './pages/ChannelProfile.jsx'
import PlaylistVideo from "./pages/PlaylistVideo.jsx"
import MyTweet from "./pages/MyTweet.jsx"
import Setting from "./pages/Setting.jsx"
import { Toaster } from "react-hot-toast"

const router = createBrowserRouter([
  {
        element: <AuthLayout/>,
        children: [
            {
                path: "/login",
                element: <Login />
            },
            {
                path: "/register",
                element: <Register />
            }
        ]
  }, {
    path: '/',
    element: <MainLayout />,
    children:[
      {
        path: "home",
        element: <Home />
      },
      {
        path: "watch/:videoId",
        element: <Watch />
      },
      {
        path: "community",
        element: <MyTweet/>
      },
      {
        path: "video-history",
        element: <VideoHistory />
      },
      {
        path: "liked-videos",
        element: <LikedVideo />
      },
      {
        path: "user-dashboard",
        element: <UserDashboard />
      },
      {
        path: "my-playlist",
        element: <Playlist />
      },
      {
        path: "subscriptions",
        element: <Subscriptions />
      },
      {
        path: "channel/:userName",
        element: <ChannelProfile />
      },
      {
        path: "playlist/:playlistId",
        element: <PlaylistVideo />
      },
      {
        path: "settings",
        element: <Setting />
      }
    ]
    
  }
]);


createRoot(document.getElementById('root')).render(
  <StrictMode>
     <Provider store={store}>
      <RouterProvider router={router} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#18181b",
            color: "#fff",
            border: "1px solid #27272a",
          },
        }}
      />
    </Provider>
  </StrictMode>,
)
