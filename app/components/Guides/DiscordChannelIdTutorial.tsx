'use client'

import { useState } from 'react'
import { ChevronRight, Settings, ToggleRight, MousePointerClick } from 'lucide-react'

export default function DiscordChannelIdGuide() {
  const [currentStep, setCurrentStep] = useState(0)

  const steps = [
    {
      title: "Open Discord Settings",
      description: "Click on the gear icon near your username to open Discord settings.",
      icon: <Settings className="w-8 h-8" />
    },
    {
      title: "Go to Advanced Tab",
      description: "In the settings menu, scroll down and click on the 'Advanced' tab.",
      icon: <ChevronRight className="w-8 h-8" />
    },
    {
      title: "Enable Developer Mode",
      description: "Find the 'Developer Mode' option and toggle it on.",
      icon: <ToggleRight className="w-8 h-8" />
    },
    {
      title: "Right-click on a Channel",
      description: "Go back to your server, right-click on the desired channel.",
      icon: <MousePointerClick className="w-8 h-8" />
    },
    {
      title: "Copy Channel ID",
      description: "In the context menu, click on 'Copy Channel ID'. The ID is now in your clipboard!",
      icon: <MousePointerClick className="w-8 h-8" />
    }
  ]

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#212121] p-4">
      <div className="w-full max-w-3xl bg-[#2a2a2a] rounded-lg overflow-hidden shadow-xl">
        <div className="p-6 text-center">
          <h2 className="text-3xl font-bold text-[#2dd4bf] mb-6">How to Get Your Discord Channel ID</h2>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className={`flex items-center p-4 rounded-lg transition-all duration-300 ${
                  currentStep === index ? 'bg-[#3a3a3a] shadow-md' : 'bg-[#2a2a2a]'
                }`}
                onClick={() => setCurrentStep(index)}
              >
                <div className={`mr-4 p-2 rounded-full ${
                  currentStep === index ? 'bg-[#2dd4bf] text-[#212121]' : 'bg-[#3a3a3a] text-[#2dd4bf]'
                }`}>
                  {step.icon}
                </div>
                <div className="text-left flex-grow">
                  <h3 className={`font-semibold ${
                    currentStep === index ? 'text-[#2dd4bf]' : 'text-white'
                  }`}>
                    {step.title}
                  </h3>
                  <p className={`text-sm ${
                    currentStep === index ? 'text-white' : 'text-gray-400'
                  }`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[#212121] p-4 flex justify-center space-x-4">
          <button 
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            className="px-6 py-2 bg-[#3a3a3a] text-white rounded hover:bg-[#2dd4bf] hover:text-[#212121] transition-colors duration-300"
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button 
            onClick={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
            className="px-6 py-2 bg-[#2dd4bf] text-[#212121] rounded hover:bg-[#20a08d] transition-colors duration-300"
            disabled={currentStep === steps.length - 1}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
