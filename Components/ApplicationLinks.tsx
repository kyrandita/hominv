'use client'

import UserContext from "@/Contexts/UserContext"
import Link from "next/link"
import { useContext } from "react"

export default function ApplicationLinks() {

  const user = useContext(UserContext)
    return <>
        {user.isLoggedIn ? <>
        <Link href={"/dashboard"}>Dashboard</Link>
        <Link href={'/inventory'}>Inventory</Link>
        <Link href={'/location'}>Locations</Link>
        </>
        :
        <>
        </>
        }
    </>
}