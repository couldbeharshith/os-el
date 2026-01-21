import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Send option 5 (Advanced analytics) and wait for output
    const { stdout, stderr } = await execAsync('printf "5\n" | ./bin/vmd', {
      maxBuffer: 1024 * 1024,
      timeout: 2000,
      shell: '/bin/bash'
    })
    
    if (stderr) {
      console.error('VMD Error:', stderr)
      return NextResponse.json({ error: 'VMD process error' }, { status: 500 })
    }

    console.log('Raw output:', stdout) // For debugging

    try {
      // Find JSON content between curly braces
      const jsonMatch = stdout.match(/\{[\s\S]*?\}/);
      if (!jsonMatch) {
        throw new Error('No JSON data found in output');
      }

      // Parse and clean the JSON data
      const cleanJson = jsonMatch[0].replace(/:\s*(inf|nan)/gi, ': 0');
      const analyticsData = JSON.parse(cleanJson);
      
      return NextResponse.json({
        fragmentation: analyticsData.fragmentation_index || 0,
        pageFaultRate: analyticsData.fault_rate || 0,
        pressureScore: analyticsData.pressure_score || 0,
        swapUsagePercent: analyticsData.swap_usage_percent || 0,
        majorFaults: analyticsData.major_faults || 0,
        minorFaults: analyticsData.minor_faults || 0,
        memory_usage: analyticsData.memory_usage || 0,  // Already in bytes
        total_memory: analyticsData.total_memory || 0,
        free_memory: analyticsData.free_memory || 0
      })
    } catch (e) {
      console.error('Failed to parse analytics:', e)
      console.error('Raw output:', stdout)
      return NextResponse.json({ 
        error: 'Invalid analytics data',
        details: e instanceof Error ? e.message : 'Unknown error',
        rawOutput: stdout.slice(0, 200) // Include some of the raw output for debugging
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Analytics API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 