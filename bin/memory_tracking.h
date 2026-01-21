#ifndef MEMORY_TRACKING_H
#define MEMORY_TRACKING_H

#include <stdlib.h>
#include "memory_types.h"

void* tracked_malloc(size_t size, const char* filename, int line);
void tracked_free(void* ptr);
void detect_memory_leaks(const char* file_name);
void test_memory_leaks(void);

#endif 