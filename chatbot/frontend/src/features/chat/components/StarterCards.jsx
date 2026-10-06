import React from "react";
import { User, Mail, MessageSquare, Code2 } from "lucide-react";

export const StarterCards = ({ onSelectCard }) => {
  const examples = [
    {
      id: 1,
      title: "Write a to-do list for a personal project",
      icon: User,
      prompt: "Write a comprehensive and prioritized to-do list for a personal project, structured into milestones, tasks, and deadlines.",
    },
    {
      id: 2,
      title: "Generate an email to reply to a job offer",
      icon: Mail,
      prompt: "Generate a professional, enthusiastic email response accepting a job offer while confirming the start date, compensation details, and onboarding steps.",
    },
    {
      id: 3,
      title: "Summarize this article in one paragraph",
      icon: MessageSquare,
      prompt: "Summarize the key takeaways and core arguments of an article in one crisp, high-impact paragraph.",
    },
    {
      id: 4,
      title: "How does AI work in a technical capacity",
      icon: Code2,
      prompt: "Explain how modern Large Language Models and AI systems work in a technical capacity, including transformer architectures, attention mechanisms, and tokenization.",
    },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto mt-10 md:mt-12 select-none">
      {/* Section Header */}
      <h3 className="text-[11px] font-semibold tracking-wider text-neutral-400 uppercase mb-4 px-1">
        GET STARTED WITH AN EXAMPLE BELOW
      </h3>

      {/* Grid of 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-3.5">
        {examples.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectCard?.(item.prompt)}
              className="group flex flex-col justify-between text-left h-32 md:h-36 p-4 rounded-2xl bg-white border border-[#EAEAE7] hover:border-neutral-300 hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <p className="text-xs md:text-[13px] font-medium text-neutral-800 leading-snug line-clamp-3 group-hover:text-neutral-950 transition-colors">
                {item.title}
              </p>

              <div className="mt-auto pt-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 group-hover:text-violet-600 group-hover:bg-violet-50 transition-colors">
                  <Icon className="w-4 h-4 stroke-[1.8]" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
