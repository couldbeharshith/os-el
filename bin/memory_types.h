// Contains all type definitions
#ifndef MEMORY_TYPES_H
#define MEMORY_TYPES_H

#include <time.h>

typedef struct {
    unsigned long virtual_addr;
    unsigned long physical_addr;
    unsigned int page_size;
    int is_present;
    int is_writable;
    int is_executable;
    int is_cached;
    int is_dirty;
    int level;
} PageTableEntry;

typedef struct {
    unsigned long start_addr;
    unsigned long end_addr;
    const char* type;
    int permissions;
    char* mapped_file;
    size_t page_size;
    int tlb_hits;
    int page_faults;
} MemoryRegion;

typedef struct MemoryBlock {
    void* ptr;
    size_t size;
    const char* file;
    int line;
    struct MemoryBlock* next;
} MemoryBlock;

typedef struct {
    size_t total_memory;
    size_t free_memory;
    size_t largest_free_block;
    double fragmentation_index;
    long major_faults;
    long minor_faults;
    double fault_rate;
    double pressure_score;
    int swap_usage_percent;
    struct timespec last_update;
    size_t memory_usage;
    size_t peak_usage;
    PageTableEntry* page_table_entries;
    int num_entries;
    MemoryRegion* memory_regions;
    int num_regions;
    unsigned long tlb_hits;
    unsigned long tlb_misses;
    double tlb_hit_rate;
    int page_table_levels;
    unsigned long page_walks;
    unsigned long page_faults;
} MemoryAnalytics;

#endif 