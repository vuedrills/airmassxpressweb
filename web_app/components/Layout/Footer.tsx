import Link from 'next/link';

export function Footer() {
    return (
        <footer className="bg-gray-50 border-t mt-auto">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4 bg-gradient-to-r from-brand-red to-brand-purple bg-clip-text text-transparent">
                            Airmass Xpress
                        </h3>
                        <p className="text-sm text-gray-600">
                            Get anything done. Connect with skilled taskers for any job.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Explore</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/browse" className="text-gray-600 hover:text-primary">
                                    Browse Tasks
                                </Link>
                            </li>
                            <li>
                                <Link href="/how-it-works" className="text-gray-600 hover:text-primary">
                                    How It Works
                                </Link>
                            </li>
                            <li>
                                <Link href="/post-task" className="text-gray-600 hover:text-primary">
                                    Post a Task
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Categories</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/browse?category=home-cleaning" className="text-gray-600 hover:text-primary">
                                    Cleaning
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?category=handyman" className="text-gray-600 hover:text-primary">
                                    Handyman
                                </Link>
                            </li>
                            <li>
                                <Link href="/browse?category=removals-delivery" className="text-gray-600 hover:text-primary">
                                    Removals
                                </Link>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Company</h4>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link href="/about" className="text-gray-600 hover:text-primary">
                                    About Us
                                </Link>
                            </li>
                            <li>
                                <Link href="/privacy" className="text-gray-600 hover:text-primary">
                                    Privacy Policy
                                </Link>
                            </li>
                            <li>
                                <Link href="/terms" className="text-gray-600 hover:text-primary">
                                    Terms of Service
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
                    <p>&copy; 2024 Airmass Xpress. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
