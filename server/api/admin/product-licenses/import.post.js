import { readMultipartFormData } from 'h3'
import Papa from 'papaparse'
import db from '~/server/utils/db'

export default defineEventHandler(async (event) => {
  try {
    // Read the uploaded file
    const form = await readMultipartFormData(event)
    const csvFile = form?.find(file => file.name === 'file')

    if (!csvFile) {
      throw new Error('No file uploaded')
    }

    // Read file content as text
    const fileContent = new TextDecoder().decode(csvFile.data)
    
    // Parse CSV
    const results = await new Promise((resolve, reject) => {
      Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        complete: resolve,
        error: reject
      })
    })

    // Validate required columns
    const requiredColumns = ['product_id', 'license_key', 'status']
    const headers = Object.keys(results.data[0] || {})
    const missingColumns = requiredColumns.filter(col => !headers.includes(col))

    if (missingColumns.length > 0) {
      throw new Error(`Missing required columns: ${missingColumns.join(', ')}`)
    }

    try {
      // Start transaction
      await db.query('START TRANSACTION')

      // Prepare the insert query
      const insertQuery = `
        INSERT INTO product_licenses 
        (product_id, license_key, status, notes, created_at, updated_at)
        VALUES (?, ?, ?, ?, NOW(), NOW())
      `

      // Insert each row
      for (const row of results.data) {
        await db.execute(insertQuery, [
          row.product_id,
          row.license_key,
          row.status || 'available',
          row.notes || null
        ])
      }

      // Commit transaction
      await db.query('COMMIT')
      
      return {
        success: true,
        imported: results.data.length,
        message: `Successfully imported ${results.data.length} licenses`
      }

    } catch (error) {
      // Rollback on error
      await db.query('ROLLBACK')
      throw error
    }

  } catch (error) {
    return createError({
      statusCode: 400,
      message: error.message
    })
  }
}) 