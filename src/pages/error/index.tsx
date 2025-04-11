import { Button } from '@/components/ui/button'
import { ArrowBigLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function ErrorPage() {
    return (
        <div className="flex bg-background flex-col justify-center items-center gap-5 min-h-screen">

            <div className='flex flex-row justify-center items-center gap-2'>
                <p className="text-4xl text-center pr-2 border-r border-[#A1A1AA]">404 </p>
                <p className='text-xl'>This page could not be found</p>
            </div>

            <Button asChild className=''>
                <Link to="/dashboard"><ArrowBigLeft className="mr-2" /> Go To Dashboard</Link>
            </Button>

        </div>
    )
}