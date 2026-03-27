import { useApiQueryWithParams, useApiQuery } from '../lib/queries'
import { useCreateMutation, useUpdateMutation, useDeleteMutation } from '../lib/mutations'
import { Document } from '../model/Document'

interface UseDocumentsParams extends Record<string, unknown> {
  type?: string
  status?: string
  patientId?: string
  visitId?: string
  category?: string
  limit?: number
  skip?: number
}

/**
 * Fetch documents with optional filters
 */
export const useDocuments = (params: UseDocumentsParams = {}) => {
  const { data, ...rest } = useApiQueryWithParams<Document[] | { documents: Document[] }, UseDocumentsParams>(
    ['documents'],
    '/documents',
    params
  )

  // Normalize response format
  const normalizedData = data
    ? Array.isArray(data)
      ? data
      : (data as { documents: Document[] }).documents || []
    : undefined

  return {
    ...rest,
    data: normalizedData,
  }
}

/**
 * Fetch a single document by ID
 */
export const useDocumentById = (id: string | undefined) => {
  return useApiQuery<Document>(
    ['documents', id],
    `/documents/${id}`,
    {
      enabled: !!id,
    }
  )
}

/**
 * Upload/create a new document
 */
export const useUploadDocument = () => {
  return useCreateMutation<Document, Partial<Document>>(
    '/documents',
    {
      queryKey: ['documents'],
      invalidateQueries: [['documents']],
    }
  )
}

/**
 * Update document metadata
 */
export const useUpdateDocument = (id: string) => {
  return useUpdateMutation<Document, Partial<Document>>(
    `/documents/${id}`,
    {
      queryKey: ['documents', id],
      invalidateQueries: [['documents'], ['documents', id]],
    }
  )
}

/**
 * Delete a document
 */
export const useDeleteDocument = () => {
  return useDeleteMutation<{ message: string }>(
    '/documents',
    {
      queryKey: ['documents'],
      invalidateQueries: [['documents']],
    }
  )
}

/**
 * Get document download URL
 */
export const getDocumentDownloadUrl = (id: string) => {
  return `/documents/${id}/download`
}

/**
 * Get document view URL
 */
export const getDocumentViewUrl = (id: string) => {
  return `/documents/${id}/view`
}

