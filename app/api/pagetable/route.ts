import { NextResponse } from 'next/server'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function GET() {
  try {
    // Send option 6 (Page table analysis) and wait for output
    const { stdout, stderr } = await execAsync('printf "6\n" | ./bin/vmd', {
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
      const pageTableData = JSON.parse(jsonStr);
      
      console.log('Parsed data:', pageTableData); // Additional debugging
      return NextResponse.json(pageTableData)
    } catch (e) {
      console.error('Failed to parse page table data:', e)
      console.error('Raw output:', stdout)
      return NextResponse.json({ 
        error: 'Invalid page table data',
        details: e instanceof Error ? e.message : 'Unknown error',
        rawOutput: stdout.slice(0, 200) // Include some of the raw output for debugging
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Page Table API Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch page table data',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    )
  }
} 