"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { AnimatedSphere } from "./animated-sphere";

const words = ["secure", "manage", "scale your portfolio"];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-40 pointer-events-none">
        <AnimatedSphere />
      </div>
      
      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-foreground/10"
            style={{
              top: `${12.5 * (i + 1)}%`,
              left: 0,
              right: 0,
            }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-foreground/10"
            style={{
              left: `${8.33 * (i + 1)}%`,
              top: 0,
              bottom: 0,
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div 
          className={`mb-8 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground">
            <span className="w-8 h-px bg-foreground/30" />
            The Intelligence to Scale.
          </span>
        </div>
        
        {/* Main headline */}
        <div className="mb-12">
          <h1 
            className={`text-[clamp(3rem,12vw,10rem)] font-display leading-[0.9] tracking-tight transition-all duration-1000 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
          >
              The Intelligence to Scale.
          </h1>
        </div>
        
        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p 
            className={`text-xl lg:text-2xl text-muted-foreground leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Your intelligent toolkit to secure, manage, and scale your building community. Empower residents and management with seamless communication, autonomous services, and operational innovation.
          </p>
          
          {/* CTAs */}
          <div 
            className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            <Button 
              size="lg" 
              className="bg-foreground hover:bg-foreground/90 text-background px-8 h-14 text-base rounded-full group"
            >
              Start free trial
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="h-14 px-8 text-base rounded-full border-foreground/20 hover:bg-foreground/5"
            >
              Watch demo
            </Button>
          </div>
        </div>
          {/* Capabilities Section */}
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                {/* Icon: Mobile App */}
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  {/* Replace with actual icon */}
                  <span role="img" aria-label="Mobile App">📱</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Resident Experience</h3>
                  <p className="text-muted-foreground">Submit requests, book amenities, check notices—all from a native app.</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                {/* Icon: Barcode & Key */}
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span role="img" aria-label="Barcode & Key">🔑</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Operations & Concierge</h3>
                  <p className="text-muted-foreground">Automated package tracking, secure key management with biometrics.</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                {/* Icon: Wrench/Checkmark */}
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span role="img" aria-label="Wrench & Check">🛠️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Unified Maintenance Hub</h3>
                  <p className="text-muted-foreground">Residents can submit and track photo-documented service requests in real-time.</p>
                </div>
              </div>
              <div className="flex items-start gap-6">
                {/* Icon: Shield/Padlock/Badge */}
                <div className="flex-shrink-0 w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  <span role="img" aria-label="Shield & Badge">🛡️</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Institutional Security</h3>
                  <p className="text-muted-foreground">Visitor & contractor screening, incident reporting, and access control.</p>
                </div>
              </div>
            </div>
            {/* Trust Bar Metrics */}
            <div className="flex flex-col gap-8 justify-center">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">20%</div>
                  <div className="text-muted-foreground">Energy Reduction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">98%</div>
                  <div className="text-muted-foreground">Tenant Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">300%</div>
                  <div className="text-muted-foreground">ROI on Smart Sensors</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">6x</div>
                  <div className="text-muted-foreground">Faster Maintenance Response</div>
                </div>
              </div>
            </div>
          </div>
        
      </div>
      
      {/* Stats marquee - full width outside container */}
      <div 
        className={`absolute bottom-24 left-0 right-0 transition-all duration-700 delay-500 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="flex gap-16 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {[
                { value: "20 days", label: "saved on builds", company: "NETFLIX" },
                { value: "98%", label: "faster deployment", company: "STRIPE" },
                { value: "300%", label: "throughput increase", company: "LINEAR" },
                { value: "6x", label: "faster to ship", company: "NOTION" },
              ].map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-4xl lg:text-5xl font-display">{stat.value}</span>
                  <span className="text-sm text-muted-foreground">
                    {stat.label}
                    <span className="block font-mono text-xs mt-1">{stat.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
      
      {/* Scroll indicator */}
      
    </section>
  );
}
