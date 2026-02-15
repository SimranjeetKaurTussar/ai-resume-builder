export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-xl w-full space-y-4">
        <h1 className="text-3xl font-bold">AI Resume Builder</h1>
        <p className="text-muted-foreground">
          Create an ATS-friendly resume in minutes. Built for students and creators.
        </p>

        <div className="flex gap-3">
          <a
            className="inline-flex items-center justify-center rounded-md bg-black text-white px-4 py-2"
            href="/app"
          >
            Go to App
          </a>
          <a
            className="inline-flex items-center justify-center rounded-md border px-4 py-2"
            href="/login"
          >
            Login
          </a>
        </div>
      </div>
    </main>
  );
}
