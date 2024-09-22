export default function Header({ userData }) {
  return (
    <header className="bg-white">
      <div className="w-full mx-auto px-4 px-4 md:px-24 pt-6 flex justify-between items-center">
        <a href="/" className="text-xl font-bold text-gray-800">User Talk</a>
        {userData && (
          <div className="flex items-center space-x-3">
            <button onClick={() => document.getElementById('newCall').showModal()} className="button-primary">Upload Call</button>
          </div>
        )}
      </div>
    </header>
  )
}

