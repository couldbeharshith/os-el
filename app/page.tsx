import { Hero } from "@/components/layout/sections/hero";
import { Features } from "@/components/layout/sections/features";
import { TechStack } from "@/components/layout/sections/tech-stack";
import { CTA } from "@/components/layout/sections/cta";
import { Navbar } from "@/components/navbar";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <TechStack />
      <CTA />
    </div>
  );
}
