"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, signOut } from "next-auth/react";
import React from "react";
import env from "@beam-australia/react-env";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState();
  const [db, setDb] = useState();

  const router = useRouter();

  const userAuthentication = async () => {
    try {
      const response = await fetch("/api/authenticate", {
        method: "GET",
      });

      if (response.ok) {
        const result = await response.json();
        const email = result.user.email;
        const password = result.user.password;

        try {
          const result = await signIn("credentials", {
            email,
            password,
            redirect: false, // Prevent automatic redirect
          });

          if (result?.error) {
            setIsLoggedIn(false);
          } else {
            //console.log("Authentication Passes");
            setIsLoggedIn(true);
            //router.push("/feed");
          }
        } catch (err) {
          console.log(err);
        }
      } else {
        const result = await response.json();
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const logout = async () => {
    try {
      const response = await fetch("/api/logout", {
        method: "GET",
      });

      if (!response.ok) {
        return;
      }
      await signOut({ redirect: false });
    } catch (error) {
      console.error("Error during sign-out or fetching user data:", error);
    }
  };

  const initFire = async (isMounted) => {
    try {
      const response = await fetch("/api/firestore", {
        method: "POST",
      });
      if (response.ok) {
        const result = await response.json();
        if (isMounted) {
          const app = initializeApp(result.firebaseConfig);
          const db = getFirestore(app);
          setDb(db);
         // console.log("From Auth: setup fb");
         
        }
      } else {
        const errorResult = await response.json();
        console.error(errorResult);
      }
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    userAuthentication();
    let isMounted = true;
    initFire(isMounted);
    return () => {
      isMounted = false; // Cleanup on unmount
    };
  }, []);

  return (
    <AuthContext.Provider value={{ isLoggedIn, logout, db }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const authContextValue = useContext(AuthContext);
  if (!authContextValue) {
    throw new ERROR("useAuth used outside of the provider");
  }
  return authContextValue;
};
