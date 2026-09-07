export async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const pdfParseModule = await import('pdf-parse')
    const pdfParse = ((pdfParseModule as unknown as { default: (b: Buffer) => Promise<{ text: string }> }).default ?? pdfParseModule) as (b: Buffer) => Promise<{ text: string }>
    const data = await pdfParse(buffer)
    return data.text.trim()
  } catch (err) {
    console.error('PDF parse error:', err)
    throw new Error('Failed to parse PDF')
  }
}

export async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value.trim()
  } catch (err) {
    console.error('DOCX parse error:', err)
    throw new Error('Failed to parse DOCX')
  }
}

export async function parseDocument(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  if (mimeType === 'application/pdf') {
    return parsePDF(buffer)
  }

  if (
    mimeType === 'application/msword' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return parseDOCX(buffer)
  }

  if (mimeType === 'text/plain') {
    return buffer.toString('utf-8').trim()
  }

  throw new Error(`Unsupported file type: ${mimeType}`)
}
