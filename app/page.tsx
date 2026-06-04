import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 text-white">
      <h1 className="text-4xl font-bold mb-8">Welcome to the App</h1>
      
      <Link 
        href="/login" 
        className="rounded-md bg-blue-600 px-6 py-3 font-semibold hover:bg-blue-500 transition-colors"
      >
        Go to Login Page
      </Link>
    </div>
  )
}