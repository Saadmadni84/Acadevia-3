export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Courses</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((course) => (
            <div key={course} className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-2">Course {course}</h3>
              <p className="text-gray-600 mb-4">Learn amazing things with our interactive course.</p>
              <button className="btn-primary">
                Start Course
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
