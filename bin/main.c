#include "memory_types.h"
#include "memory_tracking.h"
#include "memory_analysis.h"
#include "page_table.h"
#include "memory_hierarchy.h"
#include <stdio.h>
#include <stdlib.h>
#include <pthread.h>
#include <math.h>

// Global analytics instance
MemoryAnalytics g_analytics = {0};
pthread_mutex_t g_analytics_mutex = PTHREAD_MUTEX_INITIALIZER;

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
            case 1: 
                analyze_system_memory(); 
                break;
            case 2: 
                analyze_process_memory(); 
                break;
            case 3: 
                display_memory_mapping(); 
                break;
            case 4: 
                test_memory_leaks(); 
                break;
            case 5: 
                analyze_memory_advanced(); // This will exit after printing JSON
                break;
            case 6: 
                display_page_table_info();
                fflush(stdout);
                exit(0);
                break;
            case 7: 
                display_memory_hierarchy();
                fflush(stdout);
                exit(0);
                break;
            default:
                printf("Invalid choice\n");
        }
    }

    return 0;
} 