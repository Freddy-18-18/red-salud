import { useState, useEffect } from 'react';
// TODO: Import these types from app-level or @red-salud/types
type FormData = Record<string, any>;
type TabComponentProps = { setFormData: (data: FormData) => void };

export function useMedicalForm(
  formData: FormData,
  setFormData: TabComponentProps['setFormData']
) {
  const [localData, setLocalData] = useState<FormData>(formData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalData(formData);
  }, [formData]);

  const handleLocalSave = async (handleSave: TabComponentProps['handleSave']) => {
    setIsSaving(true);
    try {
      const result = await handleSave(localData);
      if (result.success) {
        setFormData(localData);
        return true;
      } else {
        throw new Error(result.error || 'Error al guardar');
      }
    } catch (error) {
      console.error('Error al guardar:', error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalData(formData);
  };

  const updateField = (field: string, value: unknown) => {
    setLocalData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return {
    localData,
    setLocalData,
    isSaving,
    handleLocalSave,
    handleCancel,
    updateField
  };
}
