/**
 * Virtual Memory Dashboard
 * A comprehensive memory analysis tool
 */

/******************************************************************************
 * Includes and Definitions
 ******************************************************************************/
#define _POSIX_C_SOURCE 199309L  // Required for CLOCK_MONOTONIC
#define _GNU_SOURCE  // For strdup

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <pthread.h>
#include <dirent.h>
#include <sys/stat.h>
#include <sys/resource.h>
#include <sys/sysinfo.h>
#include <time.h>
#include <execinfo.h>
#include <limits.h>
#include <json-c/json.h>
#include <math.h>

#define MAX_LINE_LENGTH 256
#define STACK_TRACE_DEPTH 20
#define ANALYTICS_UPDATE_INTERVAL 1 // seconds

/******************************************************************************
 * Type Definitions
 ******************************************************************************/
// Define new structures first
typedef struct {
    unsigned long virtual_addr;
    unsigned long physical_addr;
    unsigned int page_size;
    int is_present;
    int is_writable;
    int is_executable;
    int is_cached;
    int is_dirty;
    int level;  // Page table level (e.g., PML4, PDP, PD, PT)
} PageTableEntry;

typedef struct {
    unsigned long start_addr;
    unsigned long end_addr;
    char* type;        // "heap", "stack", "code", "data", "shared"
    int permissions;
    char* mapped_file;
    size_t page_size;
    int tlb_hits;
    int page_faults;
} MemoryRegion;

// Memory block structure for leak tracking
typedef struct MemoryBlock {
    void* ptr;
    size_t size;
    const char* file;
    int line;
    struct MemoryBlock* next;
} MemoryBlock;

// Structure for memory analytics
typedef struct {
    // Memory Fragmentation
    size_t total_memory;
    size_t free_memory;
    size_t largest_free_block;
    double fragmentation_index;
    
    // Page Faults
    long major_faults;
    long minor_faults;
    double fault_rate;
    
    // Memory Pressure
    double pressure_score;
    int swap_usage_percent;
    
    // Memory Timeline
    struct timespec last_update;
    size_t memory_usage;
    size_t peak_usage;
    
    // Page Table Information
    PageTableEntry* page_table_entries;
    int num_entries;
    
    // Memory Hierarchy
    MemoryRegion* memory_regions;
    int num_regions;
    
    // TLB Statistics
    unsigned long tlb_hits;
    unsigned long tlb_misses;
    double tlb_hit_rate;
    
    // Page Table Statistics
    int page_table_levels;
    unsigned long page_walks;
    unsigned long page_faults;
} MemoryAnalytics;

// Structure for memory allocation tracking
typedef struct MemoryAllocation {
    void* address;
    size_t size;
    char* stack_trace;
    time_t timestamp;
    struct MemoryAllocation* next;
} MemoryAllocation;

/******************************************************************************
 * Global Variables
 ******************************************************************************/
static pthread_mutex_t g_mutex = PTHREAD_MUTEX_INITIALIZER;
static pthread_mutex_t g_analytics_mutex = PTHREAD_MUTEX_INITIALIZER;
static MemoryBlock* g_memory_block_head = NULL;
static MemoryAnalytics g_analytics = {0};

// Analytics tracking variables
static struct timespec g_last_check_time = {0};
static long g_last_major_faults = 0;
static long g_last_minor_faults = 0;

/******************************************************************************
 * Function Declarations
 ******************************************************************************/
// Memory Tracking
void* tracked_malloc(size_t size, const char* filename, int line);
void tracked_free(void* ptr);
void detect_memory_leaks(const char* file_name);

// System Memory Analysis
void analyze_system_memory(void);
void display_memory_mapping(void);

// Process Memory Analysis
void analyze_process_memory(void);
void display_memory_usage(pid_t pid);

// Analytics
void init_analytics(void);
void update_analytics(void);
void analyze_memory_advanced(void);

// Page Table and Memory Hierarchy Analysis
void get_page_table_info(void);
void analyze_memory_hierarchy(void);
void display_page_table_info(void);
void display_memory_hierarchy(void);

// JSON Output
void output_memory_json(void);

// Testing
void test_memory_leaks(void);

// Add these function declarations in the Function Declarations section:
void output_memory_stats_json(void);
void output_page_table_json(void);
void output_memory_hierarchy_json(void);

/******************************************************************************
 * Implementation - Memory Tracking Functions
 ******************************************************************************/
void* tracked_malloc(size_t size, const char* filename, int line) {
    void* ptr = malloc(size);
    if (ptr != NULL) {
        MemoryBlock* block = malloc(sizeof(MemoryBlock));
        if (block == NULL) return ptr;

        block->ptr = ptr;
        block->size = size;
        block->file = filename;
        block->line = line;

        pthread_mutex_lock(&g_mutex);
        block->next = g_memory_block_head;
        g_memory_block_head = block;
        pthread_mutex_unlock(&g_mutex);

        // Update peak memory usage
        pthread_mutex_lock(&g_analytics_mutex);
        g_analytics.memory_usage += size;
        if (g_analytics.memory_usage > g_analytics.peak_usage) {
            g_analytics.peak_usage = g_analytics.memory_usage;
        }
        pthread_mutex_unlock(&g_analytics_mutex);
    }
    return ptr;
}

void tracked_free(void* ptr) {
    if (ptr == NULL) return;

    pthread_mutex_lock(&g_mutex);
    MemoryBlock* prev = NULL;
    MemoryBlock* curr = g_memory_block_head;
    
    while (curr != NULL && curr->ptr != ptr) {
        prev = curr;
        curr = curr->next;
    }

    if (curr != NULL) {
        if (prev != NULL) prev->next = curr->next;
        else g_memory_block_head = curr->next;

        pthread_mutex_lock(&g_analytics_mutex);
        g_analytics.memory_usage -= curr->size;
        pthread_mutex_unlock(&g_analytics_mutex);

        free(curr);
    }
    pthread_mutex_unlock(&g_mutex);
    free(ptr);
}

/******************************************************************************
 * Implementation - Analytics Functions
 ******************************************************************************/
void init_analytics(void) {
    clock_gettime(CLOCK_MONOTONIC, &g_last_check_time);
    struct rusage usage;
    if (getrusage(RUSAGE_SELF, &usage) == 0) {
        g_last_major_faults = usage.ru_majflt;
        g_last_minor_faults = usage.ru_minflt;
    }
}

void update_analytics(void) {
    struct timespec current_time;
    clock_gettime(CLOCK_MONOTONIC, &current_time);

    // Calculate time difference for fault rate
    double time_diff = (current_time.tv_sec - g_last_check_time.tv_sec) +
                      (current_time.tv_nsec - g_last_check_time.tv_nsec) / 1e9;

    // Update page faults
    struct rusage usage;
    if (getrusage(RUSAGE_SELF, &usage) == 0) {
        g_analytics.major_faults = usage.ru_majflt - g_last_major_faults;
        g_analytics.minor_faults = usage.ru_minflt - g_last_minor_faults;
        g_analytics.fault_rate = (g_analytics.major_faults + g_analytics.minor_faults) / time_diff;

        g_last_major_faults = usage.ru_majflt;
        g_last_minor_faults = usage.ru_minflt;
    }

    // Read memory info directly from /proc/meminfo
    FILE *meminfo = fopen("/proc/meminfo", "r");
    if (meminfo) {
        char line[256];
        unsigned long memTotal = 0, memFree = 0, memAvailable = 0, cached = 0, buffers = 0;
        
        while (fgets(line, sizeof(line), meminfo)) {
            if (strncmp(line, "MemTotal:", 9) == 0)
                sscanf(line, "MemTotal: %lu", &memTotal);
            else if (strncmp(line, "MemFree:", 8) == 0)
                sscanf(line, "MemFree: %lu", &memFree);
            else if (strncmp(line, "MemAvailable:", 12) == 0)
                sscanf(line, "MemAvailable: %lu", &memAvailable);
            else if (strncmp(line, "Cached:", 7) == 0)
                sscanf(line, "Cached: %lu", &cached);
            else if (strncmp(line, "Buffers:", 8) == 0)
                sscanf(line, "Buffers: %lu", &buffers);
        }
        fclose(meminfo);

        // Convert KB to bytes
        g_analytics.total_memory = memTotal * 1024;
        g_analytics.free_memory = memAvailable * 1024;  // Use MemAvailable instead of MemFree
        g_analytics.memory_usage = (memTotal - memAvailable) * 1024;

        // Calculate fragmentation index
        g_analytics.fragmentation_index = 1.0 - ((double)memAvailable / memTotal);

        // Calculate memory pressure
        double mem_used_percent = 1.0 - ((double)memAvailable / memTotal);
        
        // Get swap info
        struct sysinfo si;
        if (sysinfo(&si) == 0) {
            double swap_used_percent = si.totalswap ? 
                1.0 - ((double)si.freeswap / si.totalswap) : 0;

            g_analytics.pressure_score = 
                (mem_used_percent * 0.7) + (swap_used_percent * 0.3);
            g_analytics.swap_usage_percent = 
                (int)(swap_used_percent * 100);
        }
    }

    g_last_check_time = current_time;
}

void analyze_memory_advanced(void) {
    static int initialized = 0;
    if (!initialized) {
        init_analytics();
        initialized = 1;
    }

    update_analytics();
    
    // Clear any buffered output first
    fflush(stdout);
    
    // Output only memory stats in JSON format
    output_memory_stats_json();
    
    exit(0);
}

/******************************************************************************
 * Implementation - System Memory Analysis Functions
 ******************************************************************************/
void analyze_system_memory(void) {
    FILE *meminfo_file = fopen("/proc/meminfo", "r");
    if (meminfo_file == NULL) {
        perror("Error opening /proc/meminfo");
        return;
    }

    char line[MAX_LINE_LENGTH];
    printf("System-wide Memory Information:\n");
    while (fgets(line, sizeof(line), meminfo_file)) {
        printf("%s", line);
    }
    fclose(meminfo_file);
}

void display_memory_mapping(void) {
    FILE *fp = fopen("/proc/self/maps", "r");
    if (fp == NULL) {
        printf("Failed to open /proc/self/maps\n");
        return;
    }

    char line[MAX_LINE_LENGTH];
    printf("Virtual Memory Mapping:\n");
    while (fgets(line, sizeof(line), fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
}

/******************************************************************************
 * Implementation - Process Memory Analysis Functions
 ******************************************************************************/
void display_memory_usage(pid_t pid) {
    char command[50];
    snprintf(command, sizeof(command), "pmap -x %d", pid);
    printf("Process-wise memory usage:\n");
    fflush(stdout);
    system(command);
}

void analyze_process_memory(void) {
    pid_t pid = getpid();
    display_memory_usage(pid);
}

/******************************************************************************
 * Main Program
 ******************************************************************************/
void print_menu(void) {
    printf("\nVirtual Memory Dashboard\n");
    printf("------------------------\n");
    printf("1. System memory\n");
    printf("2. Process memory\n");
    printf("3. Virtual memory mapping\n");
    printf("4. Memory leak analysis\n");
    printf("5. Advanced analytics\n");
    printf("6. Page table analysis\n");
    printf("7. Memory hierarchy\n");
    printf("8. Exit\n");
    printf("------------------------\n");
    printf("Enter your choice (1-8): ");
}

int main(void) {
    int choice;
    
    while (1) {
        print_menu();
        if (scanf("%d", &choice) != 1) {
            while (getchar() != '\n'); // Clear input buffer
            printf("Invalid input. Please enter a number.\n");
            continue;
        }

        if (choice == 8) break;

        switch(choice) {
            case 1: analyze_system_memory(); break;
            case 2: analyze_process_memory(); break;
            case 3: display_memory_mapping(); break;
            case 4: test_memory_leaks(); break;
            case 5: 
                analyze_memory_advanced(); // This will exit after printing JSON
                break;
            case 6: 
                display_page_table_info();
                fflush(stdout);
                exit(0);  // Exit after printing JSON
                break;
            case 7: 
                display_memory_hierarchy();
                fflush(stdout);
                exit(0);  // Exit after printing JSON
                break;
            default:
                printf("Invalid choice\n");
        }
    }

    return 0;
}

void detect_memory_leaks(const char* file_name) {
    pthread_mutex_lock(&g_mutex);
    MemoryBlock* curr = g_memory_block_head;
    int leak_count = 0;
    size_t total_leaked = 0;

    printf("\nChecking for memory leaks...\n");
    printf("-----------------------------\n");

    while (curr != NULL) {
        if (strcmp(curr->file, file_name) == 0) {
            printf("Leak detected: %zu bytes at %s:%d\n", 
                   curr->size, curr->file, curr->line);
            leak_count++;
            total_leaked += curr->size;
        }
        curr = curr->next;
    }

    if (leak_count == 0) {
        printf("No memory leaks detected.\n");
    } else {
        printf("\nSummary:\n");
        printf("- Total leaks found: %d\n", leak_count);
        printf("- Total memory leaked: %zu bytes\n", total_leaked);
    }
    printf("-----------------------------\n");

    pthread_mutex_unlock(&g_mutex);
}

void test_memory_leaks(void) {
    // Allocate some memory
    int* ptr1 = tracked_malloc(sizeof(int) * 100, __FILE__, __LINE__);
    // Create a leak intentionally
    tracked_malloc(sizeof(int) * 200, __FILE__, __LINE__);  // Intentionally not stored
    
    // Free only one pointer to create a leak
    tracked_free(ptr1);
    
    // Check for leaks
    detect_memory_leaks(__FILE__);
}

// Complete the page table info function
void get_page_table_info(void) {
    FILE* pagemap = fopen("/proc/self/pagemap", "rb");
    FILE* maps = fopen("/proc/self/maps", "r");
    if (!pagemap || !maps) return;

    // Initialize or reallocate the entries array
    g_analytics.num_entries = 0;
    g_analytics.page_table_entries = malloc(1000 * sizeof(PageTableEntry)); // Start with space for 1000 entries
    
    char line[256];
    while (fgets(line, sizeof(line), maps)) {
        unsigned long start, end;
        char perms[5];
        if (sscanf(line, "%lx-%lx %4s", &start, &end, perms) == 3) {
            for (unsigned long addr = start; addr < end; addr += 4096) {
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

                    // Store the entry
                    g_analytics.page_table_entries[g_analytics.num_entries++] = entry;
                }
            }
        }
    }

    fclose(pagemap);
    fclose(maps);
}

// Complete the memory hierarchy function
void analyze_memory_hierarchy(void) {
    FILE* maps = fopen("/proc/self/maps", "r");
    if (!maps) return;

    // Initialize or reallocate the regions array
    g_analytics.num_regions = 0;
    g_analytics.memory_regions = malloc(100 * sizeof(MemoryRegion)); // Start with space for 100 regions

    char line[256];
    while (fgets(line, sizeof(line), maps)) {
        unsigned long start, end;
        char perms[5];
        char path[256] = {0};
        
        if (sscanf(line, "%lx-%lx %4s %*s %*s %*s %s", &start, &end, perms, path) >= 3) {
            MemoryRegion region = {
                .start_addr = start,
                .end_addr = end,
                .permissions = (strchr(perms, 'r') ? 4 : 0) |
                             (strchr(perms, 'w') ? 2 : 0) |
                             (strchr(perms, 'x') ? 1 : 0),
                .page_size = 4096,
                .mapped_file = strdup(path),
                .tlb_hits = 0,  // These would need hardware counters
                .page_faults = 0
            };

            // Determine region type
            if (strstr(line, "[heap]"))
                region.type = "heap";
            else if (strstr(line, "[stack]"))
                region.type = "stack";
            else if (strstr(perms, "x"))
                region.type = "code";
            else if (strlen(path) > 0)
                region.type = "shared";
            else
                region.type = "data";

            // Store the region
            g_analytics.memory_regions[g_analytics.num_regions++] = region;
        }
    }

    fclose(maps);
}

// Complete the JSON output function
void output_memory_json(void) {
    json_object* root = json_object_new_object();
    
    // Add page table information
    json_object* page_table = json_object_new_array();
    for (int i = 0; i < g_analytics.num_entries; i++) {
        json_object* entry = json_object_new_object();
        PageTableEntry* pte = &g_analytics.page_table_entries[i];
        
        json_object_object_add(entry, "virtual_addr", 
            json_object_new_int64(pte->virtual_addr));
        json_object_object_add(entry, "physical_addr", 
            json_object_new_int64(pte->physical_addr));
        json_object_object_add(entry, "page_size", 
            json_object_new_int(pte->page_size));
        json_object_object_add(entry, "is_present", 
            json_object_new_boolean(pte->is_present));
        json_object_object_add(entry, "is_writable", 
            json_object_new_boolean(pte->is_writable));
        json_object_object_add(entry, "is_executable", 
            json_object_new_boolean(pte->is_executable));
        json_object_object_add(entry, "is_cached", 
            json_object_new_boolean(pte->is_cached));
        json_object_object_add(entry, "is_dirty", 
            json_object_new_boolean(pte->is_dirty));
        json_object_object_add(entry, "level", 
            json_object_new_int(pte->level));
            
        json_object_array_add(page_table, entry);
    }
    json_object_object_add(root, "page_table", page_table);
    
    // Add memory regions
    json_object* regions = json_object_new_array();
    for (int i = 0; i < g_analytics.num_regions; i++) {
        json_object* region = json_object_new_object();
        MemoryRegion* mr = &g_analytics.memory_regions[i];
        
        json_object_object_add(region, "start_addr", 
            json_object_new_int64(mr->start_addr));
        json_object_object_add(region, "end_addr", 
            json_object_new_int64(mr->end_addr));
        json_object_object_add(region, "type", 
            json_object_new_string(mr->type));
        json_object_object_add(region, "permissions", 
            json_object_new_int(mr->permissions));
        json_object_object_add(region, "mapped_file", 
            json_object_new_string(mr->mapped_file));
        json_object_object_add(region, "page_size", 
            json_object_new_int64(mr->page_size));
        json_object_object_add(region, "tlb_hits", 
            json_object_new_int(mr->tlb_hits));
        json_object_object_add(region, "page_faults", 
            json_object_new_int(mr->page_faults));
            
        json_object_array_add(regions, region);
    }
    json_object_object_add(root, "memory_regions", regions);
    
    // Add statistics
    json_object_object_add(root, "tlb_hit_rate", 
        json_object_new_double(g_analytics.tlb_hit_rate));
    json_object_object_add(root, "page_faults",
        json_object_new_int64(g_analytics.page_faults));
    
    printf("%s\n", json_object_to_json_string_ext(root, 
        JSON_C_TO_STRING_PRETTY));
    
    json_object_put(root);
}

// Add new function to display page table info in human-readable format
void display_page_table_info(void) {
    get_page_table_info();
    
    // Output page table info in JSON format
    output_page_table_json();
    
    // Don't free here since output_page_table_json already frees it
}

// Add new function to display memory hierarchy in human-readable format
void display_memory_hierarchy(void) {
    analyze_memory_hierarchy();
    
    // Output memory hierarchy in JSON format
    output_memory_hierarchy_json();
    
    // Don't free here since output_memory_hierarchy_json already frees it
}

// Add these function declarations in the Function Declarations section:
void output_memory_stats_json(void);
void output_page_table_json(void);
void output_memory_hierarchy_json(void);

// Then implement them:
void output_memory_stats_json(void) {
    double fault_rate = isfinite(g_analytics.fault_rate) ? g_analytics.fault_rate : 0.0;
    
    printf("{\n");
    printf("  \"fragmentation_index\": %.2f,\n", g_analytics.fragmentation_index);
    printf("  \"fault_rate\": %.2f,\n", fault_rate);
    printf("  \"pressure_score\": %.2f,\n", g_analytics.pressure_score);
    printf("  \"swap_usage_percent\": %d,\n", g_analytics.swap_usage_percent);
    printf("  \"major_faults\": %ld,\n", g_analytics.major_faults);
    printf("  \"minor_faults\": %ld,\n", g_analytics.minor_faults);
    printf("  \"memory_usage\": %zu,\n", g_analytics.memory_usage);
    printf("  \"total_memory\": %zu,\n", g_analytics.total_memory);
    printf("  \"free_memory\": %zu\n", g_analytics.free_memory);
    printf("}\n");
}

void output_page_table_json(void) {
    // Don't call get_page_table_info here since it's already called in display_page_table_info
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
    
    // Free memory here
    free(g_analytics.page_table_entries);
    g_analytics.page_table_entries = NULL;  // Set to NULL after freeing
}

void output_memory_hierarchy_json(void) {
    // Don't call analyze_memory_hierarchy here since it's already called in display_memory_hierarchy
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
    
    // Clean up here
    for (int i = 0; i < g_analytics.num_regions; i++) {
        free(g_analytics.memory_regions[i].mapped_file);
    }
    free(g_analytics.memory_regions);
    g_analytics.memory_regions = NULL;  // Set to NULL after freeing
}