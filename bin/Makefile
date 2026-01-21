CC = gcc
CFLAGS = -Wall -Wextra -g
LDFLAGS = -pthread -lm

SRCS = main.c memory_tracking.c memory_analysis.c page_table.c memory_hierarchy.c
OBJS = $(SRCS:.c=.o)
TARGET = vmd

.PHONY: all clean

all: $(TARGET)

$(TARGET): $(OBJS)
	$(CC) $(OBJS) -o $(TARGET) $(LDFLAGS)

%.o: %.c
	$(CC) $(CFLAGS) -c $< -o $@

clean:
	rm -f $(OBJS) $(TARGET)