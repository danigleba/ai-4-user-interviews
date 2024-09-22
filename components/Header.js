import Image from "next/image"

export default function Header({ userData }) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="w-full mx-auto px-4 px-4 md:px-24 py-3 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-gray-800">User Talk</a>
        {userData && (
          <div className="flex items-center space-x-3">
            <button className="button-primary">Add Call</button>
          </div>
        )}
      </div>
    </header>
  )
}

