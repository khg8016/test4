import { useState } from 'react';
import { Upload, X, Wand2 } from 'lucide-react';
import { useSupabase } from '../../hooks/useSupabase';
import { ProfileImage } from '../common/ProfileImage';
import { generateImage } from '../../lib/openai';

interface ImageUploadProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
  characterName?: string;
  characterDescription?: string;
}

export function ImageUpload({ 
  label, 
  value, 
  onChange, 
  error,
  characterName,
  characterDescription 
}: ImageUploadProps) {
  const { supabase } = useSupabase();
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supabase) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('파일 크기는 5MB를 초과할 수 없습니다.');
      return;
    }

    if (!file.type.startsWith('image/')) {
      setUploadError('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `character-avatars/${fileName}`;

      const { error: uploadError, data } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError('이미지 업로드 중 오류가 발생했습니다.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerate = async () => {
    if (!characterName || !characterDescription) {
      setUploadError('캐릭터 이름과 설명을 먼저 입력해주세요.');
      return;
    }

    setIsGenerating(true);
    setUploadError(null);

    try {
      const prompt = `${characterName}. ${characterDescription}`;
      const imageUrl = await generateImage(prompt);
      onChange(imageUrl);
    } catch (err) {
      console.error('Generation error:', err);
      setUploadError('이미지 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-200">
        {label}
      </label>
      <div className="flex items-center gap-4">
        <div className="flex-1">
          {value ? (
            <div className="relative group">
              <div className="w-full h-48 rounded-lg overflow-hidden bg-[#2c2d32] ring-2 ring-gray-800">
                <ProfileImage
                  src={value}
                  alt="Avatar preview"
                  size="xl"
                  className="w-full h-full rounded-lg"
                  objectFit="contain"
                />
              </div>
              <button
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1 rounded-full bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center w-full h-48 rounded-lg border-2 border-dashed border-gray-700 bg-[#2c2d32] hover:bg-[#35363c] transition-colors cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-400">
                    {isUploading ? '업로드 중...' : '클릭하여 이미지 업로드'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG (최대 5MB)
                  </p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating || !characterName || !characterDescription}
                className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white rounded-lg transition-colors"
              >
                <Wand2 className="h-5 w-5" />
                {isGenerating ? 'AI가 이미지 생성 중...' : 'AI로 이미지 생성하기'}
              </button>
            </div>
          )}
        </div>
      </div>
      {(error || uploadError) && (
        <p className="text-sm text-red-400 mt-1">{error || uploadError}</p>
      )}
    </div>
  );
}