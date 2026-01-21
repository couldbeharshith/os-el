#ifndef MEMORY_ANALYSIS_H
#define MEMORY_ANALYSIS_H

#include "memory_types.h"

void init_analytics(void);
void update_analytics(void);
void analyze_memory_advanced(void);
void analyze_system_memory(void);
void analyze_process_memory(void);
void display_memory_mapping(void);
void output_memory_stats_json(void);

#endif 