import { useState } from 'react';
import { CharacterCategory } from '../../types/database';

interface CategoryNavigationProps {
  categories: CharacterCategory[];
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string | null) => void;
}

export function CategoryNavigation({
  categories,
  selectedCategoryId,
  onSelectCategory,
}: CategoryNavigationProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar">
        <button
          onClick={() => onSelectCategory(null)}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${!selectedCategoryId
              ? 'bg-blue-600 text-white'
              : 'bg-[#25262b] text-gray-400 hover:text-white hover:bg-[#2c2d32]'}`}
        >
          전체
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${selectedCategoryId === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-[#25262b] text-gray-400 hover:text-white hover:bg-[#2c2d32]'}`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}