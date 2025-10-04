export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center space-y-6">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary-600 to-primary-400 bg-clip-text text-transparent">
          Аура
        </h1>
        <p className="text-2xl text-muted-foreground">
          Платформа для поиска специалистов по здоровью
        </p>
        <div className="pt-4">
          <div className="inline-block px-6 py-3 bg-primary-100 text-primary-700 rounded-lg">
            🚀 Проект в разработке
          </div>
        </div>
      </div>
    </main>
  );
}

