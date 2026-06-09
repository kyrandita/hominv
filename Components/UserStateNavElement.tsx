'use client'

import UserContext, { DispatchContext } from "@/Contexts/UserContext"
import { useContext } from "react"
import * as helpers from 'nota-fucation/helpers.mjs'

export default function UserStateNavElement() {

  const user = useContext(UserContext)
  const userDispatch = useContext(DispatchContext)
    return <div>
        {user.isLoggedIn ? <>
        <div>{`Welcome ${user.username}`}</div>
        <button onClick={() => {
            helpers.sendDefaultToast({ message: 'user has logged out' })
            return userDispatch?.({ type: 'logout' })
          }}> LOG OUT </button>
        </>
        :
        <>
        <div>{'Not Logged In'}</div>
        <button onClick={() => userDispatch?.({ type: 'login' })}> LOG IN </button>
        </>
        }
    </div>
}