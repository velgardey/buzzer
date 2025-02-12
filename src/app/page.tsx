import Link from "next/link";
import { Search, Trophy, Users, Clock, ArrowRight } from "lucide-react";
import { FcGoogle } from "react-icons/fc";

const SearchBar = () => (
  <div className="relative w-full max-w-2xl">
    <input
      type="text"
      placeholder="Search for quizzes..."
      className="w-full px-6 py-4 border-2 border-gray-800 rounded-lg bg-white/80 backdrop-blur-sm
                 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:ring-opacity-50
                 font-architects-daughter text-lg placeholder:text-gray-500"
    />
    <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
  </div>
);

const QuizCategory = ({ name, icon }: { name: string; icon: string }) => (
  <button className="px-6 py-3 border-2 border-gray-800 rounded-lg hover:bg-gray-100 
                     transition-all duration-300 font-architects-daughter transform hover:-translate-y-1 
                     active:translate-y-0 flex items-center gap-2 group">
    <span className="text-xl group-hover:rotate-12 transition-transform duration-300">{icon}</span>
    {name}
  </button>
);

const TrendingQuiz = ({ title, subtitle, players, avgTime }: { 
  title: string; 
  subtitle: string;
  players: number;
  avgTime: string;
}) => (
  <div className="w-full border-2 border-gray-800 rounded-lg p-6 hover:bg-gray-100 
                  transition-all duration-300 transform hover:-translate-y-2 cursor-pointer
                  relative group bg-white/80 backdrop-blur-sm overflow-visible">
    {/* Trending Banner */}
    <div className="absolute -right-2 -top-2 flex items-center">
      {/* Decorative Corner */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
        <div className="absolute top-0 right-0 w-2 h-2 bg-gray-800 rounded-full" />
        <div className="absolute top-2 right-2 w-2 h-2 bg-gray-800 rounded-full opacity-50" />
      </div>
      
      {/* Main Banner */}
      <div className="relative z-10 bg-gradient-to-r from-yellow-400 to-yellow-500 
                      px-4 py-1.5 rounded-lg border-2 border-gray-800 font-bold shadow-md
                      flex items-center gap-2 transform -rotate-12 hover:rotate-0
                      transition-all duration-300 group-hover:scale-110">
        <span className="text-gray-800 whitespace-nowrap">Trending</span>
        <span className="animate-bounce">🔥</span>
      </div>
    </div>

    {/* Content */}
    <div className="flex flex-col min-h-[200px] pt-4">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{subtitle}</p>
      <div className="mt-auto flex justify-between text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-gray-600" />
          <span>{players.toLocaleString()} players</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-gray-600" />
          <span>{avgTime}</span>
        </div>
      </div>
    </div>

    {/* Hover Arrow */}
    <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 
                    transition-all duration-300 transform group-hover:translate-x-1">
      <ArrowRight className="text-gray-800" />
    </div>

    {/* Decorative Corner Lines */}
    <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-gray-800" />
    <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-gray-800" />
  </div>
);

export default function Home() {
  const categories = [
    { name: "General", icon: "🎯" },
    { name: "Math", icon: "🔢" },
    { name: "History", icon: "📚" },
    { name: "Logic", icon: "🧩" },
    { name: "Movies", icon: "🎬" },
    { name: "Science", icon: "🔬" },
    { name: "Geography", icon: "🌍" },
    { name: "Music", icon: "🎵" },
    { name: "Sports", icon: "⚽" },
    { name: "Language", icon: "💭" },
    { name: "Art", icon: "🎨" },
    { name: "Literature", icon: "📖" },
    { name: "Technology", icon: "💻" },
    { name: "Animals", icon: "🦁" },
    { name: "Food", icon: "🍳" },
    { name: "Celebrities", icon: "🌟" },
    { name: "Fashion", icon: "👗" }
  ];

  const trendingQuizzes = [
    { 
      title: "Quiz Masters Unite",
      subtitle: "Quiz Enthusiasts Community",
      players: 1234,
      avgTime: "15 mins"
    },
    { 
      title: "Brain Teasers Galore",
      subtitle: "Mind-Bending Challenges",
      players: 856,
      avgTime: "20 mins"
    },
    { 
      title: "Riddle Me This",
      subtitle: "Puzzle Lovers Paradise",
      players: 967,
      avgTime: "10 mins"
    },
    { 
      title: "Dive Into Trivia",
      subtitle: "Daily Brain Teasers",
      players: 1567,
      avgTime: "12 mins"
    },
    { 
      title: "Time to Shine!",
      subtitle: "Be Your Quiz Expert",
      players: 723,
      avgTime: "25 mins"
    }
  ];

  return (
    <main className="min-h-screen p-8 bg-gradient-to-br from-gray-50 to-gray-100 
                     font-architects-daughter relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '30px 30px',
        }} />
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto">
        <nav className="flex justify-between items-center mb-16 p-4 bg-white/80 backdrop-blur-sm 
                       border-2 border-gray-800 rounded-lg sticky top-4 z-50">
          <Link href="/" className="text-3xl font-bold flex items-center gap-2">
            <Trophy className="text-yellow-500" />
            Buzzer
          </Link>
          <Link 
            href="/auth/signin" 
            className="flex items-center gap-2 px-6 py-3 border-2 border-gray-800 rounded-lg 
                      hover:bg-gray-100 transition-all duration-300 text-lg group relative
                      overflow-hidden">
            <span className="relative flex items-center gap-2">
              Sign in with <FcGoogle className="w-5 h-5" />
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-gray-800 transform scale-x-0 
                             transition-transform duration-300 group-hover:scale-x-100" />
            </span>
          </Link>
        </nav>

        <div className="flex flex-col items-center text-center mb-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
            Experience the thrill of<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              interactive quizzes
            </span><br />& compete with others!
          </h1>
          <p className="text-2xl mb-12 text-gray-600">Join the fun now.</p>
          <SearchBar />
          <button className="mt-8 px-8 py-4 text-xl border-2 border-gray-800 rounded-lg 
                            bg-gradient-to-r from-purple-600 to-pink-600 text-white
                            hover:from-purple-700 hover:to-pink-700
                            transition-all duration-300 transform hover:-translate-y-1 
                            active:translate-y-0 shadow-lg">
            Start Quizzing
          </button>
        </div>

        {/* Trending Quizzes */}
        <section className="mb-24">
          <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
            <Trophy className="text-yellow-500 w-8 h-8" />
            Discover Trending Quizzes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
            {trendingQuizzes.map((quiz, index) => (
              <TrendingQuiz key={index} {...quiz} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section>
          <h2 className="text-3xl font-bold mb-8">Quiz Categories</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => (
              <QuizCategory key={category.name} name={category.name} icon={category.icon} />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
