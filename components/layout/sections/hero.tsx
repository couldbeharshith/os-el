"use client";

import { MoveRight, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RainbowButton } from "@/components/ui/rainbow-button";
import { Badge } from "@/components/ui/badge";
import { DotPattern } from "@/components/magicui/dot-pattern";
import Image from "next/image";
import Link from "next/link";

export const Hero = () => (
  <div className="relative w-full py-20 lg:py-40 overflow-hidden">
    {/* Background with dot pattern */}
    <div className="absolute inset-0">
      <DotPattern
        width={20}
        height={20}
        cx={1}
        cy={1}
        cr={1}
        className="[mask-image:radial-gradient(800px_circle_at_center,white,transparent)]"
      />
    </div>

    <div className="container mx-auto relative">
      <div className="grid grid-cols-1 gap-8 items-center lg:grid-cols-2">
        <div className="flex gap-4 flex-col">
          {/* <div>
            <Badge variant="outline">🎉 Proudly Open Source</Badge>
          </div> */}
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-lg tracking-tighter text-left font-regular">
              Memory Monitoring Dashboard
            </h1>
            <p className="text-xl leading-relaxed tracking-tight text-muted-foreground max-w-md text-left">
              Open-source system monitoring tool that provides detailed analysis and visualization of memory usage across processes and system resources.
            </p>
          </div>
          <div className="flex flex-row gap-4">
            <Link href="https://github.com/CubeStar1/memory-flow">
              <Button size="lg" className="gap-4" variant="outline">
                View on GitHub <Github className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <RainbowButton className="gap-4">
                Launch Dashboard <MoveRight className="w-4 h-4" />
              </RainbowButton>
            </Link>
          </div>
        </div>
        <div className="relative aspect-video rounded-lg overflow-hidden border">
          <Image
            src="/dashboard_system_memory_2.png"
            alt="Dashboard Preview"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  </div>
); 