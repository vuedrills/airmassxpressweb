'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { fetchCategories, fetchTasks } from '@/lib/api';
import { Search, CheckCircle2, Users, Star, ChevronDown } from 'lucide-react';
import { useState } from 'react';

export default function HomePage() {
  const [showCategories, setShowCategories] = useState(false);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const { data: tasks } = useQuery({
    queryKey: ['featured-tasks'],
    queryFn: () => fetchTasks({ sortBy: 'newest' }),
  });

  const featuredTasks = tasks?.slice(0, 6) || [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Dark Blue Background */}
        <section className="bg-[#1a2332] text-white py-20 md:py-32 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-20 right-20 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-white rounded-full"></div>
            <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-white rounded-full"></div>
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                GET ANYTHING
                <br />
                DONE
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-white/90">
                Post any task. Pick the best person. Get it done.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
                  asChild
                >
                  <Link href="/post-task">
                    Post your task for free
                    <ChevronDown className="ml-2 h-5 w-5 rotate-[-90deg]" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-[#1a2332] px-8 py-6 text-lg"
                  asChild
                >
                  <Link href="/browse">Earn money as a Tasker</Link>
                </Button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center gap-8 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>1M+ customers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>2.5M+ tasks done</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 fill-white" />
                  <span>4M+ user reviews</span>
                </div>
              </div>

              {/* Trustpilot */}
              <div className="mt-8 flex items-center justify-center gap-2 text-sm">
                <Star className="h-4 w-4 fill-green-500 text-green-500" />
                <span className="text-green-500 font-semibold">Trustpilot</span>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} className="h-4 w-4 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span>4.1 'Great' (12,111 reviews)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Categories */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Popular Categories</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {categories?.slice(0, 12).map((category) => (
                <Link
                  key={category.id}
                  href={`/browse?category=${category.slug}`}
                  className="bg-white p-6 rounded-lg border hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className="text-center">
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                      {getCategoryEmoji(category.slug)}
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{category.taskCount} tasks</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="text-center mt-8">
              <Button variant="outline" asChild>
                <Link href="/browse">View All Categories</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* We've got you covered */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-start gap-8">
                <div className="hidden md:block">
                  <div className="w-32 h-32 bg-primary/10 rounded-full flex items-center justify-center">
                    <div className="text-6xl">🛟</div>
                  </div>
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-4">We've got you covered</h2>
                  <p className="text-gray-600 mb-4">
                    Airmass Xpress is here with support and have third-party liability insurance for most tasks.
                    Payments are also held, securely, until you decide to release it.
                  </p>
                  <Link href="/how-it-works" className="text-primary hover:underline">
                    Learn more
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancellation Policy */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-4">Cancellation policy</h2>
              <p className="text-gray-600 mb-4">
                If you are responsible for cancelling this task, the Connection fee will be non-refundable.
              </p>
              <Link href="/cancellation-policy" className="text-primary hover:underline">
                Learn more
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold mb-8">Frequently Asked Questions</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    question: "I posted my task, what's next?",
                    answer:
                      "Once you post a task, taskers will make offers. Review their profiles, ratings, and offers, then choose the best one for your job.",
                  },
                  {
                    question: "What if I'm not happy with the offers?",
                    answer:
                      "You're not obligated to accept any offer. You can edit your task details or budget to attract different offers.",
                  },
                  {
                    question: "How do I work with a Tasker?",
                    answer:
                      "Once you accept an offer, coordinate with the tasker through our messaging system to finalize details and schedule the work.",
                  },
                  {
                    question: "How does payment work?",
                    answer:
                      "Payment is held securely until the task is completed. Release payment once you're satisfied with the work. Both parties are protected.",
                  },
                ].map((faq, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-6 rounded-lg border hover:border-primary transition-colors cursor-pointer"
                  >
                    <h3 className="font-semibold text-lg mb-2 flex items-center justify-between">
                      {faq.question}
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    </h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function getCategoryEmoji(slug: string): string {
  const emojiMap: Record<string, string> = {
    'home-cleaning': '✨',
    'handyman': '🔨',
    'removals-delivery': '🚚',
    'gardening': '🌿',
    'assembly': '📦',
    'painting': '🎨',
    'plumbing': '💧',
    'electrical': '⚡',
    'photography': '📸',
    'pet-care': '🐾',
    'computer-help': '💻',
    'event-catering': '🍰',
  };
  return emojiMap[slug] || '📋';
}
