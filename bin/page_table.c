#include "page_table.h"
#include "memory_types.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

extern MemoryAnalytics g_analytics;

void get_page_table_info(void) {
    FILE* pagemap = fopen("/proc/self/pagemap", "rb");
    FILE* maps = fopen("/proc/self/maps", "r");
    if (!pagemap || !maps) return;

    // Initialize or reallocate the entries array
    g_analytics.num_entries = 0;
    g_analytics.page_table_entries = malloc(1000 * sizeof(PageTableEntry));
    
    char line[256];
    while (fgets(line, sizeof(line), maps)) {
        unsigned long start, end;
        char perms[5];
        if (sscanf(line, "%lx-%lx %4s", &start, &end, perms) == 3) {
            // Sample only a few pages from each region to avoid excessive entries
            for (unsigned long addr = start; addr < end; addr += 4096 * 10) {
                unsigned long offset = (addr / 4096) * 8;
                unsigned long page_info;
                
                if (fseek(pagemap, offset, SEEK_SET) == 0 &&
                    fread(&page_info, sizeof(page_info), 1, pagemap) == 1) {
                    
                    PageTableEntry entry = {
                        .virtual_addr = addr,
                        .physical_addr = (page_info & 0x7FFFFFFFFFFFFF) * 4096,
                        .page_size = 4096,
                        .is_present = (page_info & (1ULL << 63)) != 0,
                        .is_writable = strchr(perms, 'w') != NULL,
                        .is_executable = strchr(perms, 'x') != NULL,
                        .is_cached = 1,
                        .is_dirty = (page_info & (1ULL << 55)) != 0,
                        .level = 4
                    };

                    if (g_analytics.num_entries < 1000) {
                        g_analytics.page_table_entries[g_analytics.num_entries++] = entry;
                    }
                }
            }
        }
    }

    fclose(pagemap);
    fclose(maps);
}

void output_page_table_json(void) {
    printf("{\n");
    printf("  \"page_table\": [\n");
    for (int i = 0; i < g_analytics.num_entries; i++) {
        PageTableEntry* entry = &g_analytics.page_table_entries[i];
        printf("    {\n");
        printf("      \"virtual_addr\": \"0x%lx\",\n", entry->virtual_addr);
        printf("      \"physical_addr\": \"0x%lx\",\n", entry->physical_addr);
        printf("      \"page_size\": %u,\n", entry->page_size);
        printf("      \"is_present\": %s,\n", entry->is_present ? "true" : "false");
        printf("      \"is_writable\": %s,\n", entry->is_writable ? "true" : "false");
        printf("      \"is_executable\": %s,\n", entry->is_executable ? "true" : "false");
        printf("      \"is_cached\": %s,\n", entry->is_cached ? "true" : "false");
        printf("      \"is_dirty\": %s,\n", entry->is_dirty ? "true" : "false");
        printf("      \"level\": %d\n", entry->level);
        printf("    }%s\n", i < g_analytics.num_entries - 1 ? "," : "");
    }
    printf("  ]\n");
    printf("}\n");
}

void display_page_table_info(void) {
    get_page_table_info();
    output_page_table_json();
    
    // Clean up
    free(g_analytics.page_table_entries);
    g_analytics.page_table_entries = NULL;
} 