#include "memory_hierarchy.h"
#include "memory_types.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

extern MemoryAnalytics g_analytics;

static const char* determine_region_type(const char* line, const char* perms, const char* path) {
    if (strstr(line, "[heap]"))
        return "heap";
    else if (strstr(line, "[stack]"))
        return "stack";
    else if (strstr(perms, "x"))
        return "code";
    else if (strlen(path) > 0)
        return "shared";
    else
        return "data";
}

void analyze_memory_hierarchy(void) {
    FILE* maps = fopen("/proc/self/maps", "r");
    if (!maps) return;

    // Initialize the regions array
    g_analytics.num_regions = 0;
    g_analytics.memory_regions = malloc(100 * sizeof(MemoryRegion));
    if (!g_analytics.memory_regions) {
        fclose(maps);
        return;
    }

    char line[256];
    while (fgets(line, sizeof(line), maps)) {
        unsigned long start, end;
        char perms[5] = {0};
        char path[256] = {0};
        
        if (sscanf(line, "%lx-%lx %4s %*s %*s %*s %s", &start, &end, perms, path) >= 3) {
            if (g_analytics.num_regions >= 100) break;

            MemoryRegion region = {
                .start_addr = start,
                .end_addr = end,
                .permissions = (strchr(perms, 'r') ? 4 : 0) |
                             (strchr(perms, 'w') ? 2 : 0) |
                             (strchr(perms, 'x') ? 1 : 0),
                .page_size = 4096,
                .mapped_file = strdup(path),
                .tlb_hits = 0,
                .page_faults = 0,
                .type = determine_region_type(line, perms, path)
            };

            g_analytics.memory_regions[g_analytics.num_regions++] = region;
        }
    }

    fclose(maps);
}

void output_memory_hierarchy_json(void) {
    printf("{\n");
    printf("  \"memory_regions\": [\n");
    for (int i = 0; i < g_analytics.num_regions; i++) {
        MemoryRegion* region = &g_analytics.memory_regions[i];
        printf("    {\n");
        printf("      \"type\": \"%s\",\n", region->type);
        printf("      \"start_addr\": \"0x%lx\",\n", region->start_addr);
        printf("      \"end_addr\": \"0x%lx\",\n", region->end_addr);
        printf("      \"size\": %zu,\n", (region->end_addr - region->start_addr));
        printf("      \"permissions\": \"%c%c%c\",\n",
            (region->permissions & 4) ? 'r' : '-',
            (region->permissions & 2) ? 'w' : '-',
            (region->permissions & 1) ? 'x' : '-');
        printf("      \"mapped_file\": \"%s\"\n", region->mapped_file);
        printf("    }%s\n", i < g_analytics.num_regions - 1 ? "," : "");
    }
    printf("  ]\n");
    printf("}\n");
}

void display_memory_hierarchy(void) {
    analyze_memory_hierarchy();
    output_memory_hierarchy_json();
    
    // Clean up
    for (int i = 0; i < g_analytics.num_regions; i++) {
        free(g_analytics.memory_regions[i].mapped_file);
    }
    free(g_analytics.memory_regions);
    g_analytics.memory_regions = NULL;
} 