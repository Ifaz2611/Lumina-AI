// hooks.ts
import { useState, ChangeEvent, useRef, useEffect, useCallback, DragEvent } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '../../store'
import { generateTextContent, generateStreamContent } from '../../store/user/dispatchers.user'

export const usePromptGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [base64File, setBase64File] = useState<string | null>(null)
  const [fileMimeType, setFileMimeType] = useState<string>('image/jpeg')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dispatch: AppDispatch = useDispatch()

  const { data, loading, error, generationConfig } = useSelector((state: RootState) => ({
    data: state.user.conversation?.data || [],
    loading: state.user.conversation?.loading || false,
    error: state.user.conversation?.error || null,
    generationConfig: state.user.generationConfig,
  }))

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  const processFile = useCallback((file: File) => {
    setFileError(null)
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setFileError('Only JPEG, PNG, WebP, GIF allowed.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setFileError('File too large (max 4MB).')
      return
    }
    setFileMimeType(file.type || 'image/jpeg')
    const url = URL.createObjectURL(file)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return url
    })
    const reader = new FileReader()
    reader.onload = () => {
      const base64String = (reader.result as string).split(',')[1]
      setBase64File(base64String)
    }
    reader.onerror = () => {
      setFileError('File could not be read.')
      setBase64File(null)
    }
    reader.readAsDataURL(file)
  }, [])

  const handlePromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }, [])

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      // reset input to allow re-select same file
      e.target.value = ''
    },
    [processFile]
  )

  const handleRemoveFile = useCallback(() => {
    setBase64File(null)
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    setFileError(null)
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])
  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files?.[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleSendPrompt = useCallback(() => {
    if (prompt.trim() && !loading) {
      const action = generationConfig?.streaming ? generateStreamContent : generateTextContent
      dispatch(action({ prompt: prompt.trim(), base64File, mimeType: fileMimeType }))
      setPrompt('')
      handleRemoveFile()
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }, [
    prompt,
    base64File,
    fileMimeType,
    generationConfig?.streaming,
    loading,
    dispatch,
    handleRemoveFile,
  ])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        handleSendPrompt()
      }
    },
    [handleSendPrompt]
  )

  const handleRegenerate = useCallback(() => {
    const lastUser = [...data].reverse().find((m) => m.type === 'outbound')
    if (lastUser && !loading) {
      const action = generationConfig?.streaming ? generateStreamContent : generateTextContent
      dispatch(action({ prompt: lastUser.message, base64File: null }))
    }
  }, [data, loading, generationConfig?.streaming, dispatch])

  return {
    handlePromptChange,
    handleFileChange,
    handleSendPrompt,
    handleKeyDown,
    handleRemoveFile,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleRegenerate,
    data,
    prompt,
    textareaRef,
    loading,
    error,
    base64File,
    fileMimeType,
    previewUrl,
    fileError,
    isDragging,
  }
}
