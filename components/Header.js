import Image from "next/image"

export default function Header({ userData }) {
  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Interview Analyzer</h1>
        {userData && (
          <div className="flex items-center space-x-4">
            <span className="text-gray-700">{userData.email}</span>
            {userData.user_metadata?.avatar_url && (
              <Image
                src={user.user_metadata.avatar_url}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}

