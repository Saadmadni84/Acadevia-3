export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Leaderboard</h1>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {[
                { rank: 1, name: 'John Doe', points: 2500, level: 12 },
                { rank: 2, name: 'Jane Smith', points: 2350, level: 11 },
                { rank: 3, name: 'Mike Johnson', points: 2200, level: 10 },
              ].map((user) => (
                <tr key={user.rank}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{user.rank}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.points}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.level}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
