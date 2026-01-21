import { Code2, Cpu, Gauge, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const TechStack = () => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex gap-4 flex-col items-start">
          <div>
            <Badge>Tech Stack</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-xl md:text-3xl md:text-5xl tracking-tighter lg:max-w-xl font-regular text-left">
              Built with Modern Technologies
            </h2>
            <p className="text-lg lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left">
              We use a C program to analyze the system's memory and then display the data in a Next.js dashboard. The dashboard periodically fetches the data from the C program and updates the UI.
            </p>
          </div>
        </div>
        <div className="flex justify-center items-center">
          <div className="grid text-left grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 w-full gap-2">
            <div className="flex gap-0 flex-col justify-between p-6 border rounded-md">
              <Code2 className="w-4 h-4 mb-10 text-primary" />
              <h2 className="text-2xl tracking-tighter max-w-xl text-left font-regular">
                Next.js 14
              </h2>
              <p className="text-base leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                Modern React framework with server components
              </p>
            </div>
            <div className="flex gap-0 flex-col justify-between p-6 border rounded-md">
              <Cpu className="w-4 h-4 mb-10 text-primary" />
              <h2 className="text-2xl tracking-tighter max-w-xl text-left font-regular">
                C Backend
              </h2>
              <p className="text-base leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                Low-level memory analysis engine
              </p>
            </div>
            <div className="flex gap-0 flex-col justify-between p-6 border rounded-md">
              <Gauge className="w-4 h-4 mb-10 text-primary" />
              <h2 className="text-2xl tracking-tighter max-w-xl text-left font-regular">
                Real-time
              </h2>
              <p className="text-base leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                Live memory monitoring and updates
              </p>
            </div>
            <div className="flex gap-0 flex-col justify-between p-6 border rounded-md">
              <Database className="w-4 h-4 mb-10 text-primary" />
              <h2 className="text-2xl tracking-tighter max-w-xl text-left font-regular">
                JSON Output
              </h2>
              <p className="text-base leading-relaxed tracking-tight text-muted-foreground max-w-xl text-left">
                Structured data for easy integration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
); 