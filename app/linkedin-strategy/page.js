"use client";

import OnboardingFlow from '@/components/OnboardingFlow';

export default function Page() {
  return (
    <div className="space-y-6">
      {/* <h1 className="text-3xl md:text-4xl font-extrabold">My Profile</h1> */}
      <OnboardingFlow />
    </div>
  );
}