'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const httpUrl = process.env.NEXT_PUBLIC_HTTP_URL;

export default function SpaceLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const router = useRouter()
    const [isAuthorized, setIsAuthorized] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function verifyAuth() {
            const token = localStorage.getItem("token")

            if (!token) {
                router.push('/') // Redirect to landing page
                return
            }

            try {
                const response = await fetch(`${httpUrl}/api/users/me`, {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })

                const data = await response.json()

                if (!response.ok || !data.authenticated) {
                    localStorage.removeItem("token") 
                    router.push('/') 
                }

                setIsAuthorized(true)
            } catch (err) {
                console.error("Authentication verification failed:", err)
                router.push('/') 
            } finally {
                setIsLoading(false)
            }
        }

        verifyAuth()
    }, [router])

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-[#b8b8b8] text-black text-xl font-bold uppercase tracking-widest">
                Verifying access...
            </div>
        )
    }

    if (!isAuthorized) {
        return null; 
    }

    return <>{children}</>
}