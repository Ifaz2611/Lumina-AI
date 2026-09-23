import { ChangeEvent } from 'react'
import { AppDispatch, RootState, useSelector } from '../../../store'
import { useDispatch } from 'react-redux'
import { setSelectedModel, setGenerationConfig } from '../../../store/user/userSlice'

export const useModelSelector = () => {
    const { selectedModel, generationConfig, systemInstruction } = useSelector((state: RootState) => state.user)
    const dispatch: AppDispatch = useDispatch()

    const handleSelectModel = (e: ChangeEvent<HTMLSelectElement>) => {
        dispatch(setSelectedModel(e.target.value))
    }
    const handleTempChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(setGenerationConfig({ temperature: parseFloat(e.target.value) }))
    }
    const handleTopPChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(setGenerationConfig({ topP: parseFloat(e.target.value) }))
    }
    const handleStreamingToggle = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(setGenerationConfig({ streaming: e.target.checked }))
    }

    return { selectedModel, generationConfig, systemInstruction, handleSelectModel, handleTempChange, handleTopPChange, handleStreamingToggle }
}
