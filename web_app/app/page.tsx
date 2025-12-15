'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Header } from '@/components/Layout/Header';
import { Footer } from '@/components/Layout/Footer';
import { fetchCategories } from '@/lib/api';
import { Search, ArrowRight, MapPin, Sparkles, Wrench, TreeDeciduous, Package, Droplets, Zap, Paintbrush, Wind, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('plumbing');
  const [currentSlide, setCurrentSlide] = useState(0);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Promo slides data
  const promoSlides = [
    {
      id: 1,
      bgColor: 'from-[#1a1a4e] to-[#2d2d7a]',
      title: 'Get 20% Off Your First Task',
      subtitle: 'New customers save big on home services',
      cta: 'Claim Offer',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop',
    },
    {
      id: 2,
      bgColor: 'from-[#a42444] to-[#c93d5e]',
      title: 'Top-Rated Professionals',
      subtitle: 'Verified experts ready to help',
      cta: 'Find Pros',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400&h=300&fit=crop',
    },
    {
      id: 3,
      bgColor: 'from-[#0a5c36] to-[#0d7a48]',
      title: 'Solar Installation Deals',
      subtitle: 'Save on renewable energy solutions',
      cta: 'Learn More',
      image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
    },
  ];

  // Auto-slide effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promoSlides.length]);

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/browse?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Subcategory data for each tab - matches categories.json
  const subcategoryData: Record<string, { name: string; slug: string; image: string }[]> = {
    plumbing: [
      { name: 'Drain Cleaning', slug: 'plumbing', image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=600&h=450&fit=crop' },
      { name: 'Water Heater', slug: 'plumbing', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=450&fit=crop' },
      { name: 'Pipe Repair', slug: 'plumbing', image: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=600&h=450&fit=crop' },
      { name: 'Faucet Install', slug: 'plumbing', image: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=600&h=450&fit=crop' },
    ],
    tiling: [
      { name: 'Floor Tiling', slug: 'tiling', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=450&fit=crop' },
      { name: 'Wall Tiling', slug: 'tiling', image: 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=600&h=450&fit=crop' },
      { name: 'Bathroom Tiling', slug: 'tiling', image: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=450&fit=crop' },
      { name: 'Kitchen Backsplash', slug: 'tiling', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop' },
    ],
    'electrical-service': [
      { name: 'Outlet Install', slug: 'electrical-service', image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=450&fit=crop' },
      { name: 'Lighting Install', slug: 'electrical-service', image: 'https://images.unsplash.com/photo-1565814329452-e1efa11c5b89?w=600&h=450&fit=crop' },
      { name: 'Wiring', slug: 'electrical-service', image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=600&h=450&fit=crop' },
      { name: 'Panel Upgrade', slug: 'electrical-service', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop' },
    ],
    'building-services': [
      { name: 'Home Extensions', slug: 'building-services', image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=450&fit=crop' },
      { name: 'Renovations', slug: 'building-services', image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=600&h=450&fit=crop' },
      { name: 'New Construction', slug: 'building-services', image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=600&h=450&fit=crop' },
      { name: 'Roofing', slug: 'building-services', image: 'https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?w=600&h=450&fit=crop' },
    ],
    carpentry: [
      { name: 'Custom Furniture', slug: 'carpentry', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600&h=450&fit=crop' },
      { name: 'Door Install', slug: 'carpentry', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=450&fit=crop' },
      { name: 'Cabinet Making', slug: 'carpentry', image: 'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=600&h=450&fit=crop' },
      { name: 'Deck Building', slug: 'carpentry', image: 'https://images.unsplash.com/photo-1591825729269-caeb344f6df2?w=600&h=450&fit=crop' },
    ],
    painting: [
      { name: 'Interior Painting', slug: 'painting', image: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=600&h=450&fit=crop' },
      { name: 'Exterior Painting', slug: 'painting', image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=600&h=450&fit=crop' },
      { name: 'Cabinet Painting', slug: 'painting', image: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=450&fit=crop' },
      { name: 'Fence Painting', slug: 'painting', image: 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=600&h=450&fit=crop' },
    ],
    'solar-installations': [
      { name: 'Panel Install', slug: 'solar-installations', image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=450&fit=crop' },
      { name: 'Battery Setup', slug: 'solar-installations', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop' },
      { name: 'Inverter Install', slug: 'solar-installations', image: 'https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?w=600&h=450&fit=crop' },
      { name: 'System Maintenance', slug: 'solar-installations', image: 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=450&fit=crop' },
    ],
    landscaping: [
      { name: 'Lawn Mowing', slug: 'landscaping', image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600&h=450&fit=crop' },
      { name: 'Tree Trimming', slug: 'landscaping', image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=450&fit=crop' },
      { name: 'Garden Design', slug: 'landscaping', image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&h=450&fit=crop' },
      { name: 'Irrigation', slug: 'landscaping', image: 'https://images.unsplash.com/photo-1592419044706-39796d40f98c?w=600&h=450&fit=crop' },
    ],
  };

  const getSubcategoriesForTab = (tabId: string) => {
    return subcategoryData[tabId] || subcategoryData.cleaners;
  };

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans text-slate-800">
      <Header />

      <main className="flex-1">
        {/* Hero Section - Clean & Search Focused */}
        <section className="relative pt-20 pb-32 px-4 bg-white overflow-hidden">

          <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">

            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8 text-slate-900 font-roboto-condensed">
              Post a task. Get it done.
            </h1>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full mb-8">
              <div className="flex items-center bg-white rounded-md shadow-sm border border-slate-200 overflow-hidden h-12">
                <div className="flex-grow relative h-full">
                  <Input
                    type="text"
                    placeholder="Describe your project or problem — be as detailed as you'd like."
                    className="w-full h-full pl-4 border-0 focus-visible:ring-0 text-sm bg-transparent placeholder:text-slate-400 text-slate-700 rounded-none"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Button
                  type="submit"
                  className="h-full px-6 bg-[#a42444] hover:bg-[#8a1d3a] text-white font-semibold text-sm rounded-none transition-colors"
                >
                  Get Offers
                </Button>
              </div>
            </form>
            {/* Promotional Banner Slider */}
            <div className="w-full relative">
              <div className="relative h-32 md:h-40 rounded-lg overflow-visible">
                {/* Slides */}
                {promoSlides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out rounded-lg overflow-hidden ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                      }`}
                  >
                    <div className={`h-full bg-gradient-to-r ${slide.bgColor} flex items-center justify-center px-12 md:px-16`}>
                      <div className="w-full flex items-center justify-between gap-4 md:gap-8">
                        <div className="flex items-center gap-4 md:gap-6">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="hidden md:block w-20 h-20 object-cover rounded-lg shadow-lg"
                          />
                          <div className="text-white">
                            <h3 className="text-lg md:text-xl font-bold mb-1">{slide.title}</h3>
                            <p className="text-white/80 text-xs md:text-sm">{slide.subtitle}</p>
                          </div>
                        </div>
                        <Button className="bg-white text-slate-900 hover:bg-slate-100 font-semibold px-4 md:px-6 text-sm shrink-0">
                          {slide.cta}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Left Arrow - Rounded rectangle at edge */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev - 1 + promoSlides.length) % promoSlides.length)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-16 rounded-r-lg bg-white shadow-md hover:shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>

                {/* Right Arrow - Rounded rectangle at edge */}
                <button
                  onClick={() => setCurrentSlide((prev) => (prev + 1) % promoSlides.length)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-16 rounded-l-lg bg-white shadow-md hover:shadow-lg flex items-center justify-center text-slate-400 hover:text-slate-600 transition-all"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>

                {/* Indicator Dots */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                  {promoSlides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === currentSlide
                        ? 'bg-white w-4'
                        : 'bg-white/50 hover:bg-white/70 w-1.5'
                        }`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Category Tabs Section */}
        <section className="pt-4 pb-10 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* Category Tabs */}
            <div className="relative mb-10">
              {/* Scrollable tabs container with fade mask */}
              <div className="overflow-hidden pr-16">
                <div
                  ref={tabsRef}
                  className="flex items-center gap-6 pb-2 border-b border-slate-100 overflow-x-auto scrollbar-hide"
                  style={{ scrollBehavior: 'smooth' }}
                >
                  {[
                    { id: 'plumbing', Icon: Droplets, label: 'Plumbing' },
                    { id: 'tiling', Icon: Package, label: 'Tiling' },
                    { id: 'electrical-service', Icon: Zap, label: 'Electrical' },
                    { id: 'building-services', Icon: Wrench, label: 'Building' },
                    { id: 'carpentry', Icon: TreeDeciduous, label: 'Carpentry' },
                    { id: 'painting', Icon: Paintbrush, label: 'Painting' },
                    { id: 'solar-installations', Icon: Sparkles, label: 'Solar' },
                    { id: 'landscaping', Icon: Wind, label: 'Landscaping' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`flex flex-col items-center px-5 py-4 transition-colors whitespace-nowrap relative shrink-0 ${activeCategory === cat.id
                        ? 'text-slate-900'
                        : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                      <cat.Icon className="h-6 w-6 mb-2" strokeWidth={1.5} />
                      <span className="text-sm font-medium">{cat.label}</span>
                      {activeCategory === cat.id && (
                        <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#009fd6] rounded-full"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              {/* Gradient fade on right side */}
              <div className="absolute right-14 top-0 bottom-0 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
              {/* Floating Arrow Button - aligned with tabs */}
              <button
                onClick={() => tabsRef.current?.scrollBy({ left: 200, behavior: 'smooth' })}
                className="absolute right-0 top-6 flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-lg border border-slate-100 text-slate-600 hover:text-slate-900 hover:shadow-xl transition-all z-10"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
            </div>

            {/* Subcategory Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {getSubcategoriesForTab(activeCategory).map((sub, i) => (
                <Link
                  key={i}
                  href={`/browse?category=${sub.slug}`}
                  className="group relative aspect-[3/4] rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                >
                  <img
                    src={sub.image}
                    alt={sub.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  <div className="absolute bottom-4 left-4">
                    <h3 className="text-white font-semibold text-lg">{sub.name}</h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Value Proposition / How It Works */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                See what Airmass Xpress can do for you
              </h2>
              <p className="text-lg text-slate-600">
                We make it easy to find the right person for the job, every time.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Pick your price",
                  description: "See clear pricing estimates for your project before you book. No hidden fees or surprises.",
                  Icon: Package
                },
                {
                  title: "Screened professionals",
                  description: "We verify pros so you can book with confidence. Check reviews, ratings, and past work.",
                  Icon: Sparkles
                },
                {
                  title: "Hire with ease",
                  description: "Chat directly with pros, agree on details, and pay securely through our platform.",
                  Icon: Zap
                }
              ].map((item, i) => (
                <div key={i} className="text-center p-6 rounded-2xl hover:bg-slate-50 transition-colors">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-6">
                    <item.Icon className="h-8 w-8 text-slate-500" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-[#2a2d72] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Are you a pro? Grow your business with us.
                </h2>
                <p className="text-lg text-blue-100 mb-8">
                  Join thousands of professionals who use Airmass Xpress to find new customers and grow their business on their own terms.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button size="lg" className="bg-white text-[#2a2d72] hover:bg-blue-50 font-bold px-8" asChild>
                    <Link href="/register">Join as a Pro</Link>
                  </Button>
                  <Button size="lg" variant="outline" className="bg-transparent border-white text-white hover:bg-white/10 hover:text-white" asChild>
                    <Link href="/how-it-works">Learn more</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

function getCategoryCountImage(slug: string): string {
  const imageMap: Record<string, string> = {
    'home-cleaning': 'https://images.unsplash.com/photo-1581578731117-104f8a3d3dfa?w=800&h=600&fit=crop',
    'handyman': 'https://images.unsplash.com/photo-1505798577917-a651a5d40320?w=800&h=600&fit=crop',
    'removals-delivery': 'https://images.unsplash.com/photo-1600518464441-9154a4dea21b?w=800&h=600&fit=crop',
    'gardening': 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800&h=600&fit=crop',
    'assembly': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop',
    'painting': 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800&h=600&fit=crop',
    'plumbing': 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?w=800&h=600&fit=crop',
    'electrical': 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=800&h=600&fit=crop',
    'photography': 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=600&fit=crop',
    'pet-care': 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&h=600&fit=crop',
    'computer-help': 'https://images.unsplash.com/photo-1587614382346-4ec70e388b28?w=800&h=600&fit=crop',
    'event-catering': 'https://images.unsplash.com/photo-1555244162-803834f70033?w=800&h=600&fit=crop',
  };
  return imageMap[slug] || 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&h=600&fit=crop';
}
