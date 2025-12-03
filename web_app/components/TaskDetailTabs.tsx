'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

interface TaskDetailTabsProps {
    taskId: string;
}

// Comprehensive task-specific dummy data for all 15 tasks
const taskOffers: Record<string, any[]> = {
    'task-1': [
        { id: 'offer-1-1', userName: 'Tendai Moyo', userAvatar: '/avatars/91.jpg', amount: 100, message: 'I can fix the burst pipe today. 10+ years plumbing experience.', rating: 4.9, reviewCount: 127, createdAt: '2 hours ago', isNew: false, isVerified: true, availability: 'Today · Tomorrow · Wed 4 Dec', showAcceptButton: true },
        { id: 'offer-1-2', userName: 'Farai Chikwanha', userAvatar: '/avatars/17.jpg', amount: 90, message: 'Licensed plumber available now. Can replace entire section if needed.', rating: 5.0, reviewCount: 98, createdAt: '3 hours ago', isNew: false, isVerified: true, availability: 'Today', showAcceptButton: true },
        { id: 'offer-1-3', userName: 'Simba Mhango', userAvatar: '/avatars/80.jpg', amount: 110, message: 'Emergency plumbing specialist. Can come within the hour if needed.', createdAt: '4 hours ago', isNew: true, availability: 'Today · Tomorrow', showAcceptButton: true },
    ],
    'task-2': [
        { id: 'offer-2-1', userName: 'Rufaro Ndlovu', userAvatar: '/avatars/female16.jpg', amount: 180, message: 'Experienced tiler with 8 years in bathroom renovations. Waterproofing included.', rating: 5.0, reviewCount: 89, createdAt: '1 hour ago', isNew: false, isVerified: true, availability: 'Today · Tomorrow · Thu 4 Dec', showAcceptButton: true },
        { id: 'offer-2-2', userName: 'Chipo Khumalo', userAvatar: '/avatars/female62.jpg', amount: 200, message: 'Professional tiling service. All materials included. 5 year guarantee on workmanship.', createdAt: '5 hours ago', isNew: true, availability: 'Mon 2 Dec · Tue 3 Dec', showAcceptButton: true },
    ],
    'task-3': [
        { id: 'offer-3-1', userName: 'Munashe Sibanda', userAvatar: '/avatars/female92.jpg', amount: 160, message: 'Certified electrician. Will provide COC certificate. Can start this week.', rating: 4.9, reviewCount: 67, createdAt: '4 hours ago', isNew: false, isVerified: true, availability: 'Thu 5 Dec · Fri 6 Dec', replyCount: 3, showAcceptButton: true },
    ],
    'task-4': [
        { id: 'offer-4-1', userName: 'Simba Mhango', userAvatar: '/avatars/80.jpg', amount: 3200, message: 'Professional builder with 15+ years experience. Can show previous work.', rating: 4.7, reviewCount: 56, createdAt: '1 day ago', isNew: false, isVerified: false, availability: 'Flexible', showAcceptButton: true },
        { id: 'offer-4-2', userName: 'Tendai Moyo', userAvatar: '/avatars/91.jpg', amount: 3400, message: 'Registered builder. We handle all council approvals and inspections. Full team available.', rating: 4.9, reviewCount: 127, createdAt: '2 days ago', isNew: false, isVerified: true, showAcceptButton: true },
    ],
    'task-5': [
        { id: 'offer-5-1', userName: 'Tapiwa Nyathi', userAvatar: '/avatars/63.jpg', amount: 750, message: 'Custom carpentry specialist. Quality hardwood guaranteed.', rating: 4.9, reviewCount: 112, createdAt: '5 hours ago', isNew: false, isVerified: true, availability: 'This week', showAcceptButton: false },
    ],
    'task-6': [
        { id: 'offer-6-1', userName: 'Nyasha Dube', userAvatar: '/avatars/female89.jpg', amount: 320, message: 'Professional painter. Neat finishes, no mess. 6 years experience.', rating: 4.6, reviewCount: 45, createdAt: '3 hours ago', isNew: false, isVerified: false, showAcceptButton: false },
    ],
    'task-7': [
        { id: 'offer-7-1', userName: 'Munashe Sibanda', userAvatar: '/avatars/female92.jpg', amount: 4200, message: 'Certified solar installer. Tier 1 panels and inverters. 5 year warranty.', rating: 4.9, reviewCount: 67, createdAt: '1 day ago', isNew: false, isVerified: true, showAcceptButton: false },
        { id: 'offer-7-2', userName: 'Anesu Mapfumo', userAvatar: '/avatars/54.jpg', amount: 3900, message: 'Solar energy specialist. Can design custom system for your needs. Free consultation.', createdAt: '2 days ago', isNew: true, showAcceptButton: false },
    ],
    'task-8': [
        { id: 'offer-8-1', userName: 'Chipo Khumalo', userAvatar: '/avatars/female62.jpg', amount: 550, message: 'Professional landscaper. Can transform your garden completely.', rating: 4.8, reviewCount: 73, createdAt: '6 hours ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
    'task-9': [
        { id: 'offer-9-1', userName: 'Simba Mhango', userAvatar: '/avatars/80.jpg', amount: 200, message: 'Specialized in fuel pump repairs. Have all diagnostic equipment.', rating: 4.7, reviewCount: 56, createdAt: '2 hours ago', isNew: false, isVerified: false, showAcceptButton: false },
    ],
    'task-10': [
        { id: 'offer-10-1', userName: 'Tendai Moyo', userAvatar: '/avatars/91.jpg', amount: 120, message: 'Qualified mechanic with Toyota specialist training.', rating: 4.9, reviewCount: 127, createdAt: '4 hours ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
    'task-11': [
        { id: 'offer-11-1', userName: 'Anesu Mapfumo', userAvatar: '/avatars/54.jpg', amount: 1100, message: 'Registered architect. Modern designs, council approved plans.', rating: 4.7, reviewCount: 34, createdAt: '2 days ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
    'task-12': [
        { id: 'offer-12-1', userName: 'Anesu Mapfumo', userAvatar: '/avatars/54.jpg', amount: 1800, message: 'Experienced PM. Managed 20+ renovation projects successfully.', rating: 4.7, reviewCount: 34, createdAt: '1 day ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
    'task-13': [
        { id: 'offer-13-1', userName: 'Anesu Mapfumo', userAvatar: '/avatars/54.jpg', amount: 380, message: 'Structural engineer. Detailed reports with recommendations.', rating: 4.7, reviewCount: 34, createdAt: '5 hours ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
    'task-14': [
        { id: 'offer-14-1', userName: 'Munashe Sibanda', userAvatar: '/avatars/female92.jpg', amount: 1400, message: 'Electrical engineering professional. Commercial building specialist.', rating: 4.9, reviewCount: 67, createdAt: '1 day ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
    'task-15': [
        { id: 'offer-15-1', userName: 'Anesu Mapfumo', userAvatar: '/avatars/54.jpg', amount: 1650, message: 'Mechanical engineer. Energy efficient HVAC design specialist.', rating: 4.7, reviewCount: 34, createdAt: '2 days ago', isNew: false, isVerified: true, showAcceptButton: false },
    ],
};

const taskQuestions: Record<string, any[]> = {
    'task-1': [
        { id: 'q-1-1', userName: 'Tapiwa Nyathi', userAvatar: '/avatars/63.jpg', message: 'Is the main valve shut off? How much water damage is there?', createdAt: '1 hour ago' },
    ],
    'task-2': [
        { id: 'q-2-1', userName: 'Simba Mhango', userAvatar: '/avatars/80.jpg', message: 'What size are the tiles? Is the substrate already prepared?', createdAt: '30 minutes ago' },
    ],
    'task-3': [
        { id: 'q-3-1', userName: 'Nyasha Dube', userAvatar: '/avatars/female89.jpg', message: 'Do you have electrical plans or should I design the layout?', createdAt: '2 hours ago' },
    ],
    'task-4': [
        { id: 'q-4-1', userName: 'Tapiwa Nyathi', userAvatar: '/avatars/63.jpg', message: 'Do you have council approval already? What are the foundation requirements?', createdAt: '1 day ago' },
    ],
    'task-5': [
        { id: 'q-5-1', userName: 'Rufaro Ndlovu', userAvatar: '/avatars/female16.jpg', message: 'What type of wood would you like? I can provide samples.', createdAt: '3 hours ago' },
    ],
    'task-6': [
        { id: 'q-6-1', userName: 'Simba Mhango', userAvatar: '/avatars/80.jpg', message: 'What brand of paint did you buy? How many coats needed?', createdAt: '2 hours ago' },
    ],
    'task-7': [
        { id: 'q-7-1', userName: 'Farai Chikwanha', userAvatar: '/avatars/17.jpg', message: 'Do you want lithium or lead-acid batteries? What backup time required?', createdAt: '1 day ago' },
    ],
    'task-8': [
        { id: 'q-8-1', userName: 'Nyasha Dube', userAvatar: '/avatars/female89.jpg', message: 'What style of landscaping do you prefer? Modern or traditional?', createdAt: '4 hours ago' },
    ],
    'task-9': [
        { id: 'q-9-1', userName: 'Tendai Moyo', userAvatar: '/avatars/91.jpg', message: 'What fuel type is the pump for? Diesel or petrol?', createdAt: '1 hour ago' },
    ],
    'task-10': [
        { id: 'q-10-1', userName: 'Munashe Sibanda', userAvatar: '/avatars/female92.jpg', message: 'How many kilometers on the engine? Any error codes showing?', createdAt: '3 hours ago' },
    ],
    'task-11': [
        { id: 'q-11-1', userName: 'Rudo Chihota', userAvatar: '/avatars/53.jpg', message: 'What architectural style are you looking for? Plot size?', createdAt: '2 days ago' },
    ],
    'task-12': [
        { id: 'q-12-1', userName: 'Chipo Khumalo', userAvatar: '/avatars/female62.jpg', message: 'What is the total budget for the renovation? Timeline expected?', createdAt: '1 day ago' },
    ],
    'task-13': [
        { id: 'q-13-1', userName: 'Tapiwa Nyathi', userAvatar: '/avatars/63.jpg', message: 'What type of foundation does the current house have?', createdAt: '4 hours ago' },
    ],
    'task-14': [
        { id: 'q-14-1', userName: 'Farai Chikwanha', userAvatar: '/avatars/17.jpg', message: 'What is the expected electrical load? Three-phase supply available?', createdAt: '1 day ago' },
    ],
    'task-15': [
        { id: 'q-15-1', userName: 'Munashe Sibanda', userAvatar: '/avatars/female92.jpg', message: 'How many rooms? Server room needs special cooling?', createdAt: '2 days ago' },
    ],
};

export default function TaskDetailTabs({ taskId }: TaskDetailTabsProps) {
    const [activeTab, setActiveTab] = useState<'offers' | 'questions'>('offers');
    const [showVerificationInfo, setShowVerificationInfo] = useState(false);

    const offers = taskOffers[taskId] || [];
    const questions = taskQuestions[taskId] || [];

    return (
        <div className="mt-8 border-t pt-6">
            {/* Connected Tab Bar - Centered and Wider */}
            <div className="flex gap-0 mb-6 bg-gray-200 rounded-full p-1 max-w-2xl mx-auto">
                <button
                    onClick={() => setActiveTab('offers')}
                    className={`flex-1 py-3 rounded-full font-semibold text-base transition-all ${activeTab === 'offers'
                        ? 'text-white shadow-sm'
                        : 'text-gray-600'
                        } `}
                    style={activeTab === 'offers' ? { backgroundColor: '#1a2847' } : {}}
                >
                    Offers
                </button>
                <button
                    onClick={() => setActiveTab('questions')}
                    className={`flex-1 py-3 rounded-full font-semibold text-base transition-all ${activeTab === 'questions'
                        ? 'text-white shadow-sm'
                        : 'text-gray-600'
                        } `}
                    style={activeTab === 'questions' ? { backgroundColor: '#1a2847' } : {}}
                >
                    Questions
                </button>
            </div>

            <div className="py-6">
                {activeTab === 'offers' ? (
                    <div className="space-y-6">
                        {offers.length > 0 ? (
                            offers.map((offer) => (
                                <div key={offer.id} className="pb-6 border-b last:border-b-0">
                                    {/* Header with avatar and name */}
                                    <div className="flex items-start gap-4 mb-4">
                                        <Link
                                            href={`/profile/${offer.userId || 'user-1'}`}
                                            className="flex-shrink-0"
                                        >
                                            <img
                                                src={offer.userAvatar}
                                                alt={offer.userName}
                                                className="w-16 h-16 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                            />
                                        </Link>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-[#1a2847]">{offer.userName}</h3>
                                                {offer.isVerified && (
                                                    <button onClick={() => setShowVerificationInfo(true)}>
                                                        <CheckCircle2 className="h-5 w-5 fill-blue-600 text-white" />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Show either rating or New badge */}
                                            {offer.isNew ? (
                                                <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-sm rounded-full">
                                                    New!
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-lg font-bold text-gray-900">{offer.rating}</span>
                                                    <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                                                    <span className="text-gray-500 text-sm">({offer.reviewCount})</span>
                                                </div>
                                            )}
                                        </div>
                                        <button className="text-gray-400 hover:text-gray-600">
                                            <span className="text-2xl">⋯</span>
                                        </button>
                                    </div>

                                    {/* Availability */}
                                    {offer.availability && (
                                        <div className="bg-gray-50 rounded-lg px-4 py-3 mb-4">
                                            <p className="text-sm">
                                                <span className="font-bold text-[#1a2847]">Availability:</span>{' '}
                                                <span className="text-gray-700">{offer.availability}</span>
                                            </p>
                                        </div>
                                    )}

                                    {/* Message */}
                                    <div className="bg-gray-50 rounded-lg px-4 py-3 mb-3">
                                        <p className="text-gray-700 text-sm leading-relaxed">
                                            {offer.message}
                                        </p>
                                        {offer.message.length > 150 && (
                                            <button className="text-blue-600 text-sm font-medium mt-2 flex items-center gap-1">
                                                More <span>▼</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* View replies if available */}
                                    {offer.replyCount && offer.replyCount > 0 && (
                                        <button className="text-blue-600 text-sm font-medium mb-3 flex items-center gap-1">
                                            ← View replies ({offer.replyCount})
                                        </button>
                                    )}

                                    {/* Timestamp and Accept button */}
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-gray-500">
                                            {offer.createdAt}
                                        </div>
                                        {/* Only show Accept button if user is the task poster */}
                                        {offer.showAcceptButton && (
                                            <Button size="sm" className="bg-[#1a2847] hover:bg-[#1a2847]/90">
                                                Accept
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500 py-8">No offers yet</p>
                        )}
                    </div>
                ) : (
                    <div>
                        <p className="text-sm text-gray-500 text-center mb-6">
                            These messages are public. Don't share private info. We never ask for payment, send
                            links/QR codes, or request verification in Questions.
                        </p>

                        <div className="space-y-4 mb-6">
                            {questions.length > 0 ? (
                                questions.map((question) => (
                                    <div key={question.id} className="flex items-start gap-3 bg-white p-4 rounded-lg">
                                        <Link
                                            href={`/profile/${question.userId || 'user-2'}`}
                                            className="flex-shrink-0"
                                        >
                                            <img
                                                src={question.userAvatar}
                                                alt={question.userName}
                                                className="w-10 h-10 rounded-full object-cover hover:ring-2 hover:ring-primary transition-all cursor-pointer"
                                            />
                                        </Link>
                                        <div className="flex-1">
                                            <div className="font-semibold text-sm mb-1">{question.userName}</div>
                                            <p className="text-sm text-gray-700 mb-2">{question.message}</p>
                                            <span className="text-xs text-gray-500">{question.createdAt}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-center text-gray-500 py-8">No questions yet</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 border rounded-lg p-4 bg-white">
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                👤
                            </div>
                            <input
                                type="text"
                                placeholder="Ask a question"
                                className="flex-1 outline-none text-sm"
                            />
                            <Button variant="ghost" size="sm">
                                Send
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Verification Info Modal */}
            <Dialog open={showVerificationInfo} onOpenChange={setShowVerificationInfo}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle2 className="h-6 w-6 fill-blue-600 text-white" />
                            Verified Tasker
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 text-sm">
                        <p className="text-gray-700">
                            Taskers with this badge have been verified with a Government Photo ID.
                        </p>
                        <a href="#" className="text-blue-600 hover:underline inline-block">
                            Learn more
                        </a>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
