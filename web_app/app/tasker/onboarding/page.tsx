'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, updateTaskerProfile } from '@/lib/api';
import { User, TaskerProfile } from '@/types';
import { WizardLayout } from '@/components/TaskerOnboarding/WizardLayout';
import { Step1BasicInfo } from '@/components/TaskerOnboarding/Step1BasicInfo';
import { Step2Identity } from '@/components/TaskerOnboarding/Step2Identity';
import { Step3Professions } from '@/components/TaskerOnboarding/Step3Professions';
import { Step4Portfolio } from '@/components/TaskerOnboarding/Step4Portfolio';
import { StepQualifications } from '@/components/TaskerOnboarding/Step5Qualifications';
import { Step6Availability } from '@/components/TaskerOnboarding/Step6Availability';
import { Step5Payment } from '@/components/TaskerOnboarding/Step5Payment';
import { Loader2 } from 'lucide-react';
import { GoogleMapsLoader } from '@/components/GoogleMapsLoader';

export default function TaskerOnboardingPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStep, setCurrentStep] = useState(1);

    // Form Data State
    const [formData, setFormData] = useState<Partial<TaskerProfile>>({});

    useEffect(() => {
        async function loadUser() {
            try {
                const currentUser = await getCurrentUser();
                if (!currentUser) {
                    router.push('/login?redirect=/tasker/onboarding');
                    return;
                }
                setUser(currentUser);

                // Resume from existing profile if available
                if (currentUser.taskerProfile) {
                    setFormData({
                        ...currentUser.taskerProfile,
                        // Ensure arrays are initialized
                        idDocumentUrls: currentUser.taskerProfile.idDocumentUrls || [],
                        professionIds: currentUser.taskerProfile.professionIds || [],
                        portfolioUrls: currentUser.taskerProfile.portfolioUrls || [],
                        qualifications: currentUser.taskerProfile.qualifications || [],
                    });

                    // Resume logic: if status is approved/pending, maybe redirect?
                    // For now, let them edit.
                    // If status is 'not_started' or 'in_progress', go to last step.
                    if (currentUser.taskerProfile.onboardingStep && currentUser.taskerProfile.onboardingStep > 1) {
                        // Ensure we don't go past 6 or whatever logic
                        setCurrentStep(Math.min(currentUser.taskerProfile.onboardingStep, 6));
                    }
                }
            } catch (error) {
                console.error(error);
                router.push('/');
            } finally {
                setLoading(false);
            }
        }
        loadUser();
    }, [router]);

    const handleUpdateData = (newData: any) => {
        setFormData(prev => ({ ...prev, ...newData }));
    };

    const handleNext = async () => {
        if (!user) return;

        // Persist current step data to backend
        try {
            await updateTaskerProfile({
                ...formData,
                onboardingStep: currentStep + 1 // Advance step marker
            });

            setCurrentStep(prev => prev + 1);
        } catch (error) {
            console.error('Failed to save progress', error);
            alert('Failed to save progress. Please check your connection.');
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(1, prev - 1));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <GoogleMapsLoader>
            <WizardLayout
                currentStep={currentStep}
                totalSteps={7}
                title="Become a Tasker"
                description="Join our community of professionals and start earning."
            >
                {currentStep === 1 && (
                    <Step1BasicInfo
                        data={formData}
                        updateData={handleUpdateData}
                        onNext={handleNext}
                        user={user}
                    />
                )}
                {currentStep === 2 && (
                    <Step2Identity
                        data={formData}
                        updateData={handleUpdateData}
                        onNext={handleNext}
                        onBack={handleBack}
                        user={user}
                    />
                )}
                {currentStep === 3 && (
                    <Step3Professions
                        data={formData}
                        updateData={handleUpdateData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}
                {currentStep === 4 && (
                    <Step4Portfolio
                        data={formData}
                        updateData={handleUpdateData}
                        onNext={handleNext}
                        onBack={handleBack}
                        user={user}
                    />
                )}
                {/* Step 5: Qualifications */}
                {currentStep === 5 && (
                    <StepQualifications
                        data={formData}
                        updateData={handleUpdateData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {/* Step 6: Availability */}
                {currentStep === 6 && (
                    <Step6Availability
                        data={formData}
                        updateData={handleUpdateData}
                        onNext={handleNext}
                        onBack={handleBack}
                    />
                )}

                {/* Step 7: Payment */}
                {currentStep === 7 && (
                    <Step5Payment
                        data={formData}
                        updateData={handleUpdateData}
                        onBack={handleBack}
                    />
                )}
            </WizardLayout>
        </GoogleMapsLoader>
    );
}
