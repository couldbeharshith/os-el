import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Send option 7 (Memory hierarchy) and wait for output
    const { stdout, stderr } = await execAsync('printf "7\n" | ./bin/vmd', {
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
      // Find JSON content between curly braces, ignoring menu text
      const jsonMatch = stdout.match(/\{[\s\S]*\}/g);  // Changed regex to global match
      if (!jsonMatch || !jsonMatch[jsonMatch.length - 1]) {  // Take the last match
        throw new Error('No JSON data found in output');
      }

      // Clean the JSON string by removing any non-JSON text
      const jsonStr = jsonMatch[jsonMatch.length - 1].trim();
      const hierarchyData = JSON.parse(jsonStr);
      
      console.log('Parsed data:', hierarchyData); // Additional debugging
      return NextResponse.json(hierarchyData)
    } catch (e) {
      console.error('Failed to parse memory hierarchy data:', e)
      console.error('Raw output:', stdout)
      return NextResponse.json({ 
        error: 'Invalid memory hierarchy data',
        details: e instanceof Error ? e.message : 'Unknown error',
        rawOutput: stdout.slice(0, 200) // Include some of the raw output for debugging
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Memory Hierarchy API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch memory hierarchy data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 