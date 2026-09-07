import { createContext, useContext, useState, ReactNode } from 'react';
import { Article, articles as seedArticles } from '@/data/journal';

interface ArticlesContextValue {
  articles: Article[];
  addArticle: (article: Article) => void;
  getById: (id: string) => Article | undefined;
  getByAuthor: (authorId: string) => Article[];
}

const ArticlesContext = createContext<ArticlesContextValue | undefined>(undefined);

/**
 * Каркас хранения публикаций для Phase 0/UI-восстановления.
 * Данные живут только в памяти вкладки — реальная БД и модерация
 * подключаются в Phase 5/6 (EDITOR, MODERATION).
 */
export const ArticlesProvider = ({ children }: { children: ReactNode }) => {
  const [articles, setArticles] = useState<Article[]>(seedArticles);

  const addArticle = (article: Article) => setArticles((prev) => [article, ...prev]);
  const getById = (id: string) => articles.find((a) => a.id === id);
  const getByAuthor = (authorId: string) => articles.filter((a) => a.authorId === authorId);

  return (
    <ArticlesContext.Provider value={{ articles, addArticle, getById, getByAuthor }}>
      {children}
    </ArticlesContext.Provider>
  );
};

export const useArticles = () => {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error('useArticles must be used within ArticlesProvider');
  return ctx;
};
