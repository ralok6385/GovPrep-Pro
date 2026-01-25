import Link from 'next/link';
import { ArrowRight, Trophy } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-2 rounded-lg">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight">GovPrep</span>
        </div>
        <div className="space-x-4">
          <Link href="/login" className="px-4 py-2 hover:text-indigo-300 transition-colors">Login</Link>
          <Link href="/signup" className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-all font-medium">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32 flex flex-col items-center text-center">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full bg-indigo-900/50 border border-indigo-500/30 text-indigo-300 text-sm font-medium animate-fade-in">
          Indias #1 Learning Platform
        </div>
        <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
          Crack <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Government Exams</span> <br />
          with Confidence
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mb-12">
          The most comprehensive preparation platform for SSC, Banking, Railway, and Defence exams. Live classes, Mock Tests, and Personalized Analytics.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/signup" className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-xl shadow-indigo-500/20">
            Start Learning for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/login" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg transition-all">
            Explore Courses
          </Link>
        </div>

        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-gray-400">
          <div>
            <div className="text-3xl font-bold text-white mb-2">10M+</div>
            <div>Students</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">50k+</div>
            <div>Selections</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">100+</div>
            <div>Top Educators</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white mb-2">4.8/5</div>
            <div>App Rating</div>
          </div>
        </div>
      </main>
    </div>
  );
}
