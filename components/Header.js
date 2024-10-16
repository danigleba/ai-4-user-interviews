export default function Header({ userData }) {
  return (
    <header className="bg-[#F5F5F2]">
      <div className="w-full mx-auto px-4 px-4 md:px-6 pt-6 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-gray-800">🙊 User Talk</a>
        {userData && (
          <div className="flex items-center space-x-3">
            <button onClick={() => document.getElementById('newCall').showModal()} className="button-primary">Add Call</button>
          </div>
        )}
      </div>
    </header>
  )
}

