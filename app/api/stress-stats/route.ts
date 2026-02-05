import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Find all node processes running the stress test
    const { stdout } = await execAsync('ps aux | grep "node.*Buffer.alloc" | grep -v grep || echo ""')
    
    if (!stdout.trim()) {
      return NextResponse.json({ 
        running: false,
        processes: []
      })
    }

    const lines = stdout.trim().split('\n')
    const processes = lines.map(line => {
      const parts = line.trim().split(/\s+/)
      // ps aux format: USER PID %CPU %MEM VSZ RSS TTY STAT START TIME COMMAND
      return {
        pid: parseInt(parts[1]),
        cpu: parseFloat(parts[2]),
        mem_percent: parseFloat(parts[3]),
        vsz: parseInt(parts[4]) * 1024, // Convert KB to bytes
        rss: parseInt(parts[5]) * 1024, // Convert KB to bytes (actual memory used)
        rss_mb: Math.round(parseInt(parts[5]) / 1024), // Convert to MB
        command: parts.slice(10).join(' ')
      }
    })

    const totalRSS = processes.reduce((sum, p) => sum + p.rss, 0)
    const totalRSS_MB = Math.round(totalRSS / (1024 * 1024))

    return NextResponse.json({ 
      running: true,
      processes,
      total_rss: totalRSS,
      total_rss_mb: totalRSS_MB,
      process_count: processes.length
    })

  } catch (error) {
    console.error('Stress stats error:', error)
    return NextResponse.json({ 
      running: false,
      processes: [],
      error: 'Failed to get stress stats'
    })
  }
}
