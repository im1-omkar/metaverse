'use client'
import React, { useEffect, useRef } from 'react'
import { useMediaStore } from '@/lib/mediaStore'
import { useRouter } from 'next/navigation';

const Page = () => {
  const setStream = useMediaStore((state)=>state.setStream);
  const videoRef = useRef<HTMLVideoElement>(null);
  const router = useRouter()

  useEffect(()=>{

    const getUserMedia = async ()=>{
      const stream = await navigator.mediaDevices.getUserMedia({
        video:true,
        audio:true
      });
      
      setStream(stream);

      if(!videoRef.current || !stream) return;
      videoRef.current.srcObject= stream;
      videoRef.current.play();
    }

    getUserMedia();

  },[setStream])


  return (
    <div className='h-screen w-screen flex flex-col justify-center items-center '>
      <div className='text-6xl'>Your Setup Page</div>
      <div >
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className='w-full rounded-lg'
        />
      </div>
      <button className='bg-green-700 h-30 w-30' onClick={() => { router.push('/space/123') }}>to go SPACE</button>
     </div>
  )
}

export default Page