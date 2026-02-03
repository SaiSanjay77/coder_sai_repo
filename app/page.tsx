import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-stone-950 text-white">
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
        {/* Senior Side */}
        <Link
          href="/tutorial"
          className="group flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-500 hover:to-amber-700 transition"
        >
          <div className="text-7xl mb-6">👴</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">I am a Senior</h1>
          <p className="text-2xl md:text-3xl text-amber-100 text-center max-w-md">
            Click here for help
          </p>
          <div className="mt-10 bg-white/20 text-white px-8 py-4 rounded-2xl text-xl font-semibold group-hover:bg-white/30">
            Start Tutorial
          </div>
        </Link>

        {/* Buddy Side */}
        <Link
          href="/login?role=buddy"
          className="group flex flex-col items-center justify-center px-8 py-16 bg-gradient-to-br from-slate-800 to-slate-900 hover:from-slate-700 hover:to-slate-900 transition"
        >
          <div className="text-7xl mb-6">🤝</div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">I am a Volunteer</h1>
          <p className="text-2xl md:text-3xl text-slate-200 text-center max-w-md">
            Help seniors stay safe
          </p>
          <div className="mt-10 bg-white/10 text-white px-8 py-4 rounded-2xl text-xl font-semibold group-hover:bg-white/20">
            Continue to Login
          </div>
        </Link>
      </div>
    </div>
  );
}
