// hooks.ts
import { useState, ChangeEvent, useRef, useEffect, useCallback } from "react"
import { useDispatch, useSelector } from "react-redux"
import { AppDispatch, RootState } from "../../store"
import { generateTextContent } from "../../store/user/dispatchers.user"

export const usePromptGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [base64File, setBase64File] = useState<string | null>(null)
  const dispatch: AppDispatch = useDispatch()
  
  const { data, loading, error } = useSelector(
    (state: RootState) => state.user.conversation || { data: [], loading: false, error: null }
  )

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [prompt])

  const handlePromptChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value)
  }, [])

  const handleFileChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1]
        setBase64File(base64String)
      }
      reader.onerror = () => {
        console.error("File could not be read")
        setBase64File(null)
      }
      reader.readAsDataURL(file)
    }
  }, [])

  const handleSendPrompt = useCallback(() => {
    if (prompt.trim() && !loading) {
      dispatch(generateTextContent({ prompt: prompt.trim(), base64File }))
      setPrompt('')
      setBase64File(null)
      
      // Reset textarea height after sending
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto'
      }
    }
  }, [prompt, base64File, loading, dispatch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendPrompt()
    }
  }, [handleSendPrompt])

  return { 
    handlePromptChange, 
    handleFileChange, 
    handleSendPrompt, 
    handleKeyDown, 
    data, 
    prompt, 
    textareaRef, 
    loading, 
    error, 
    base64File 
  }
}