import Image from "next/image"

export default function Header({ userData }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-gray-800">User Talk</a>
        {userData && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">{userData.email}</span>
            {userData.user_metadata?.avatar_url && (
              <Image
                src={userData.user_metadata.avatar_url}
                alt="Profile"
                width={32}
                height={32}
                className="rounded-full border border-gray-200"
              />
            )}
          </div>
        )}
      </div>
    </header>
  )
}

