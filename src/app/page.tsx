import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Аура
        </h1>
        <p className="text-2xl text-gray-600">
          Платформа для поиска специалистов по здоровью
        </p>
        
        <div className="pt-8 space-y-4">
          <Link
            href="/catalog"
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Найти специалиста
          </Link>
          
          <div className="text-sm text-gray-500">
            Психологи • Коучи • Тренеры • Нутрициологи
          </div>
        </div>
      </div>
    </main>
  );
}

