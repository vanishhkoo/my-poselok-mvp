import { useParams, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { authors } from '@/data/journal';
import { useArticles } from '@/contexts/ArticlesContext';
import ArticleCard from '@/components/journal/ArticleCard';

const AuthorPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getByAuthor } = useArticles();
  const author = authors.find((a) => a.id === id);

  if (!author) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <Icon name="UserX" size={36} className="mx-auto text-muted-foreground" />
          <h1 className="mt-5 font-head text-[26px] font-extrabold">Автор не найден</h1>
          <button
            onClick={() => navigate('/')}
            className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground"
          >
            Вернуться в журнал
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  const publishedArticles = getByAuthor(author.id).filter((a) => a.status === 'published');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-[1100px] px-5 py-12 md:py-16">
        <div className="flex flex-col items-center gap-4 border-b border-border pb-10 text-center sm:flex-row sm:text-left">
          <span className="flex h-20 w-20 flex-none items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Icon name="User" size={32} />
          </span>
          <div>
            <h1 className="font-head text-[26px] font-extrabold md:text-[30px]">{author.name}</h1>
            <p className="mt-2 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
              {author.bio}
            </p>
            <div className="mt-3 flex items-center justify-center gap-1.5 text-[13px] text-muted-foreground sm:justify-start">
              <Icon name="Newspaper" size={14} />
              {publishedArticles.length} публикаций
            </div>
          </div>
        </div>

        <div className="mt-10">
          <h2 className="font-head text-[20px] font-bold">Публикации автора</h2>
          {publishedArticles.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border py-16 text-center">
              <Icon name="FileText" size={28} className="mx-auto text-muted-foreground" />
              <p className="mt-3 text-muted-foreground">Пока нет опубликованных статей.</p>
            </div>
          ) : (
            <div className="mt-6 grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {publishedArticles.map((a) => (
                <ArticleCard key={a.id} article={a} onClick={() => navigate(`/journal/${a.id}`)} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AuthorPage;
