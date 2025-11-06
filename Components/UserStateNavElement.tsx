'use client'

import UserContext, { DispatchContext } from "@/Contexts/UserContext"
import { useContext } from "react"

export default function UserStateNavElement() {

  const user = useContext(UserContext)
  const userDispatch = useContext(DispatchContext)
    return <>
        {user.isLoggedIn ? <>
        <div>{`Welcome ${user.username}`}</div>
        <button onClick={() => userDispatch?.({ type: 'logout' })}> LOG OUT </button>
        </>
        :
        <>
        <div>{'Not Logged In'}</div>
        <button onClick={() => userDispatch?.({ type: 'login' })}> LOG IN </button>
        </>
        }
    </>
}