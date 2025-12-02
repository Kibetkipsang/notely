import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore  from '../stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { PenLine, Sparkles, Lock, Zap } from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-soft">
              <PenLine className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Notely
            </span>
          </div>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-soft hover:shadow-medium transition-all"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary shadow-soft animate-fade-in">
            <Sparkles className="h-4 w-4" />
            Beautiful notes, organized effortlessly
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight animate-fade-in">
            Capture your ideas,
            <br />
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              beautifully.
            </span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-in">
            A lovable personal notes app designed to help you organize your thoughts,
            ideas, and inspirations in one beautiful place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4 animate-fade-in">
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-primary hover:opacity-90 text-primary-foreground font-medium shadow-medium hover:shadow-strong transition-all text-lg px-8 py-6"
            >
              <PenLine className="mr-2 h-5 w-5" />
              Start Writing
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">
          <div className="p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-medium transition-all group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Beautiful Design
            </h3>
            <p className="text-muted-foreground">
              A clean, modern interface that makes writing a joy. Focus on your ideas,
              not the UI.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-medium transition-all group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Zap className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Lightning Fast
            </h3>
            <p className="text-muted-foreground">
              Optimistic updates mean your changes appear instantly. No waiting, no lag.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-medium transition-all group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary/10 text-primary mb-4 group-hover:scale-110 transition-transform">
              <Lock className="h-6 w-6" />
            </div>
            <h3 className="font-display text-xl font-bold text-foreground mb-2">
              Secure & Private
            </h3>
            <p className="text-muted-foreground">
              Your notes are encrypted and private. Only you can access your content.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 mt-20 border-t border-border">
        <div className="text-center text-muted-foreground text-sm">
          <p>© 2025 Notely. Built with love.</p>
        </div>
      </footer>
    </div>
  );
}