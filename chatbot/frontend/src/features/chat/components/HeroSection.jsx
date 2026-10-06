import React from "react";

export const HeroSection = ({ userName = "Jason" }) => {
  // Determine time-of-day greeting dynamically
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  const greeting = getGreeting();

  return (
    <div className="flex flex-col items-center justify-center text-center select-none pt-4 pb-8 md:pt-6 md:pb-10">
      {/* 3D Glowing Purple AI Orb */}
      <div className="relative mb-7 flex flex-col items-center">
        {/* Ambient atmospheric purple glow behind orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/25 blur-2xl rounded-full pointer-events-none" />

        {/* Orb image container */}
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden animate-orb-float z-10">
          <img
            src="/purple-orb.jpg"
            alt="AI Core Orb"
            className="w-full h-full object-cover rounded-full"
            loading="eager"
          />
        </div>

        {/* Soft radial diffused ground shadow */}
        <div className="w-20 sm:w-24 h-3 bg-purple-900/15 blur-md rounded-full mt-2" />
      </div>

      {/* Typography Greetings */}
      <div className="space-y-1">
        <h2 className="text-2xl sm:text-3xl font-medium text-[#191919] tracking-tight">
          {greeting}, {userName}
        </h2>
        <h1 className="text-3xl sm:text-4xl md:text-[42px] font-semibold text-[#191919] tracking-tight">
          What&apos;s on{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 via-purple-500 to-fuchsia-600">
            your mind?
          </span>
        </h1>
      </div>
    </div>
  );
};
