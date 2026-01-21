import { Badge } from "@/components/ui/badge";
import Image from "next/image";

const features = [
  {
    title: "System Memory Overview",
    description: "Monitor system-wide memory statistics in real-time with detailed usage breakdowns and trends.",
    image: "/dashboard_system_memory_2.png"
  },
  {
    title: "Process Memory Analysis",
    description: "Track and analyze memory usage patterns of individual processes to identify potential issues.",
    image: "/dashboard_process_memory_2.png"
  },
  {
    title: "Memory Mapping View",
    description: "Visualize virtual memory mappings and understand memory allocation patterns across your system.",
    image: "/dashboard_mapping_2.png"
  },
  {
    title: "Memory Health Indicators",
    description: "Get instant insights into your system's memory health with comprehensive analytics and alerts.",
    image: "/analytics_2.png"
  },
  {
    title: "Page Table Explorer",
    description: "Examine virtual to physical memory mappings with detailed page table visualization.",
    image: "/page_table.png"
  },
  {
    title: "Memory Hierarchy View",
    description: "Understand your system's memory hierarchy with interactive visualizations of different memory levels.",
    image: "/memory_heirarchy.png"
  }
];

export const Features = () => (
  <div className="w-full py-20 lg:py-40">
    <div className="container mx-auto">
      <div className="flex flex-col gap-10">
        <div className="flex gap-4 flex-col items-start">
          <div>
            <Badge>Features</Badge>
          </div>
          <div className="flex gap-2 flex-col">
            <h2 className="text-3xl md:text-5xl tracking-tighter max-w-xl font-regular text-left">
              Comprehensive Memory Analysis
            </h2>
            <p className="text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
              Get deep insights into your system's memory usage with our powerful monitoring and analysis tools.
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col gap-2">
              <div className="relative aspect-video rounded-md overflow-hidden mb-2">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl tracking-tight">{feature.title}</h3>
              <p className="text-muted-foreground text-base">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);