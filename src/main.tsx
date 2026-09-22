import { createBrowserRouter } from 'react-router-dom';
import { createRoot } from "react-dom/client";
import { RouterProvider } from 'react-router-dom';
import App from "./App";
import "./index.css";
import Login from './Pages/Login';
import Signup from './Pages/Singup'
import { AuthContextProvider } from './AuthContext';
import Error from './Pages/error';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import supabase from './supabaseClient';

const IndexRoute = () => {
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        navigate('/dashboard');
      } else {
        navigate('/login');
      }
    });
  }, [navigate]);
  return null;
};


const route = createBrowserRouter([
  {
    path:'/',
    element:<IndexRoute/>
  },
  {
    path:'/login',
    element:<Login/>
  },
  {
    path:'/signup',
    element:<Signup/>
  },
  {
    path:'/dashboard',
    element:<App/>
  },
  {
    path:'*',
    element:<Error/>
  }


])

createRoot(document.getElementById("root")!).render(
      <AuthContextProvider>
        <RouterProvider router={route}/>
    </AuthContextProvider>

);