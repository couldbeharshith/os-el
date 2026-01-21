#include "memory_tracking.h"
#include <stdio.h>
#include <pthread.h>
#include <string.h>

// Global variables for memory tracking
static pthread_mutex_t g_mutex = PTHREAD_MUTEX_INITIALIZER;
extern pthread_mutex_t g_analytics_mutex;
static MemoryBlock* g_memory_block_head = NULL;
extern MemoryAnalytics g_analytics;

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
    int* ptr1 = tracked_malloc(sizeof(int) * 100, __FILE__, __LINE__);
    tracked_malloc(sizeof(int) * 200, __FILE__, __LINE__);
    tracked_free(ptr1);
    detect_memory_leaks(__FILE__);
} 