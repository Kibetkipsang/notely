import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { PenLine, Sparkles, Lock, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();



  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-orange-50">
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-10">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-orange-100 to-amber-100 border border-orange-200 text-sm font-medium text-orange-700 shadow-sm animate-fade-in">
            
            Beautiful notes, organized effortlessly
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 leading-tight animate-fade-in">
            Capture your ideas,
            <br />
            <span className="bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              beautifully.
            </span>
          </h1>

          {/* Description */}
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed animate-fade-in">
            A delightful personal notes app designed to help you organize your thoughts,
            ideas, and inspirations in one beautiful place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all text-lg px-8 py-6"
            >
              <PenLine className="mr-3 h-5 w-5" />
              Start Writing
              <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/auth')}
              className="border-orange-300 text-orange-600 hover:bg-orange-50 font-medium text-lg px-8 py-6"
            >
              Learn More
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          {/* Feature 1 */}
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-orange-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Beautiful Design
            </h3>
            <p className="text-gray-600 leading-relaxed">
              A clean, modern interface that makes writing a joy. Focus on your ideas,
              not the UI.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-orange-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Lightning Fast
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Optimistic updates mean your changes appear instantly. No waiting, no lag.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="p-8 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 group hover:border-orange-200">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-r from-orange-100 to-amber-100 text-orange-600 mb-6 group-hover:scale-110 transition-transform duration-300">
              <Lock className="h-7 w-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Secure & Private
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Your notes are encrypted and private. Only you can access your content.
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="max-w-3xl mx-auto mt-32 p-8 rounded-2xl bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to organize your thoughts?
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of writers and thinkers who trust Notely.
          </p>
          <Button
            size="lg"
            onClick={() => navigate('/auth')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium shadow-lg hover:shadow-xl transition-all px-10 py-6 text-lg"
          >
            Get Started Free
          </Button>
        </div>
      </main>
    </div>
  );
}