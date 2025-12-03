'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Menu, Search, User, Plus } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HeaderProps {
    maxWidthClass?: string;
}

export function Header({ maxWidthClass }: HeaderProps) {
    const pathname = usePathname();
    const { loggedInUser, logout } = useStore();

    const navLinks = [
        { href: '/browse', label: 'Browse Tasks' },
        { href: '/how-it-works', label: 'How It Works' },
    ];

    return (
        <header className="sticky top-0 zi-50 w-full border-b bg-white">
            <div className={`container mx-auto ${maxWidthClass || 'px-4 max-w-6xl'}`}>
                <div className="flex h-16 items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <img
                            src="/logo.png"
                            alt="Airmass Xpress"
                            className="h-8 w-auto"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex items-center space-x-6">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-gray-700'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Desktop Actions */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loggedInUser ? (
                            <>
                                <Button variant="default" asChild>
                                    <Link href="/post-task">
                                        <Plus className="h-4 w-4 mr-2" />
                                        Post a Task
                                    </Link>
                                </Button>
                                <Link href="/messages" className="text-gray-700 hover:text-primary">
                                    Messages
                                </Link>
                                <Link href="/dashboard" className="flex items-center space-x-2">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={loggedInUser.avatar} />
                                        <AvatarFallback>
                                            {loggedInUser.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                            </>
                        ) : (
                            <>
                                <Button variant="ghost" asChild>
                                    <Link href="/login">Log In</Link>
                                </Button>
                                <Button variant="default" asChild>
                                    <Link href="/register">Sign Up</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu */}
                    <Sheet>
                        <SheetTrigger asChild className="md:hidden">
                            <Button variant="ghost" size="icon">
                                <Menu className="h-6 w-6" />
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="right" className="w-[300px]">
                            <div className="flex flex-col space-y-6 mt-6">
                                {loggedInUser ? (
                                    <>
                                        <div className="flex items-center space-x-3 pb-4 border-b">
                                            <Avatar className="h-12 w-12">
                                                <AvatarImage src={loggedInUser.avatar} />
                                                <AvatarFallback>{loggedInUser.name.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-semibold">{loggedInUser.name}</p>
                                                <p className="text-sm text-gray-500">{loggedInUser.email}</p>
                                            </div>
                                        </div>
                                        <Link href="/post-task" className="w-full">
                                            <Button className="w-full">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Post a Task
                                            </Button>
                                        </Link>
                                    </>
                                ) : (
                                    <div className="flex flex-col space-y-3">
                                        <Button variant="default" asChild>
                                            <Link href="/login">Log In</Link>
                                        </Button>
                                        <Button variant="outline" asChild>
                                            <Link href="/register">Sign Up</Link>
                                        </Button>
                                    </div>
                                )}

                                <nav className="flex flex-col space-y-4">
                                    {navLinks.map((link) => (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="text-gray-700 hover:text-primary font-medium"
                                        >
                                            {link.label}
                                        </Link>
                                    ))}
                                    {loggedInUser && (
                                        <>
                                            <Link href="/dashboard" className="text-gray-700 hover:text-primary font-medium">
                                                Dashboard
                                            </Link>
                                            <Link href="/messages" className="text-gray-700 hover:text-primary font-medium">
                                                Messages
                                            </Link>
                                            <Link href="/profile/user-demo" className="text-gray-700 hover:text-primary font-medium">
                                                Profile
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="text-left text-red-600 hover:text-red-700 font-medium"
                                            >
                                                Log Out
                                            </button>
                                        </>
                                    )}
                                </nav>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </header>
    );
}
