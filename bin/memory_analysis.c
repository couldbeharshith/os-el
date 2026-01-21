#include "memory_analysis.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/resource.h>
#include <sys/sysinfo.h>
#include <pthread.h>
#include <math.h>

// Global variables
extern MemoryAnalytics g_analytics;
static pthread_mutex_t g_analytics_mutex = PTHREAD_MUTEX_INITIALIZER;
static struct timespec g_last_check_time = {0};
static long g_last_major_faults = 0;
static long g_last_minor_faults = 0;

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

    double time_diff = (current_time.tv_sec - g_last_check_time.tv_sec) +
                      (current_time.tv_nsec - g_last_check_time.tv_nsec) / 1e9;

    struct rusage usage;
    if (getrusage(RUSAGE_SELF, &usage) == 0) {
        g_analytics.major_faults = usage.ru_majflt - g_last_major_faults;
        g_analytics.minor_faults = usage.ru_minflt - g_last_minor_faults;
        g_analytics.fault_rate = (g_analytics.major_faults + g_analytics.minor_faults) / time_diff;

        g_last_major_faults = usage.ru_majflt;
        g_last_minor_faults = usage.ru_minflt;
    }

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

        pthread_mutex_lock(&g_analytics_mutex);
        g_analytics.total_memory = memTotal * 1024;
        g_analytics.free_memory = memAvailable * 1024;
        g_analytics.memory_usage = (memTotal - memAvailable) * 1024;
        g_analytics.fragmentation_index = 1.0 - ((double)memAvailable / memTotal);

        struct sysinfo si;
        if (sysinfo(&si) == 0) {
            double swap_used_percent = si.totalswap ? 
                1.0 - ((double)si.freeswap / si.totalswap) : 0;
            double mem_used_percent = 1.0 - ((double)memAvailable / memTotal);

            g_analytics.pressure_score = 
                (mem_used_percent * 0.7) + (swap_used_percent * 0.3);
            g_analytics.swap_usage_percent = 
                (int)(swap_used_percent * 100);
        }
        pthread_mutex_unlock(&g_analytics_mutex);
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
    output_memory_stats_json();
    exit(0);
}

void analyze_system_memory(void) {
    FILE *meminfo_file = fopen("/proc/meminfo", "r");
    if (meminfo_file == NULL) {
        printf("Error opening /proc/meminfo\n");
        return;
    }

    char line[256];
    printf("System-wide Memory Information:\n");
    while (fgets(line, sizeof(line), meminfo_file)) {
        printf("%s", line);
    }
    fclose(meminfo_file);
}

void analyze_process_memory(void) {
    pid_t pid = getpid();
    char command[50];
    snprintf(command, sizeof(command), "pmap -x %d", pid);
    printf("Process-wise memory usage:\n");
    fflush(stdout);
    system(command);
}

void display_memory_mapping(void) {
    FILE *fp = fopen("/proc/self/maps", "r");
    if (fp == NULL) {
        printf("Failed to open /proc/self/maps\n");
        return;
    }

    char line[256];
    printf("Virtual Memory Mapping:\n");
    while (fgets(line, sizeof(line), fp) != NULL) {
        printf("%s", line);
    }
    fclose(fp);
} 