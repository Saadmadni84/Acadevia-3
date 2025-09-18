// Add this import to your existing page.tsx
import Link from 'next/link'
import { User } from 'lucide-react'

// Add this button somewhere in your existing homepage content
// (between your existing sections)
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Your existing content */}
      
      {/* Add this section somewhere in your page */}
      <section className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Link 
            href="/profile"
            className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-8 py-4 rounded-lg font-medium text-lg transition-colors"
          >
            <User className="w-5 h-5" />
            Manage Profile
          </Link>
        </div>
      </section>
      
      {/* Rest of your existing content */}
    </div>
  )
}

