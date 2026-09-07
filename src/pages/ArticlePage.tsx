import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Icon from '@/components/ui/icon';
import { useArticles } from '@/contexts/ArticlesContext';

const ArticlePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getById, getByAuthor } = useArticles();
  const article = id ? getById(id) : undefined;

  if (!article) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-2xl px-5 py-24 text-center">
          <Icon name="FileQuestion" size={36} className="mx-auto text-muted-foreground" />
          <h1 className="mt-5 font-head text-[26px] font-extrabold">Статья не найдена</h1>
          <p className="mt-2 text-muted-foreground">
            Возможно, публикация ещё не одобрена или ссылка устарела.
          </p>
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

  const authorArticles = getByAuthor(article.authorId).filter((a) => a.id !== article.id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-2xl px-5 py-10 md:py-16">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-1.5 text-[14px] font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <Icon name="ArrowLeft" size={16} />
          Назад
        </button>

        <img src={article.cover} alt="" className="h-64 w-full rounded-2xl object-cover md:h-80" />

        <div className="mt-6 flex items-center gap-2">
          <span className="soft-accent w-fit rounded-md px-2.5 py-1 text-[12px] font-medium">
            {article.category}
          </span>
          {article.status === 'moderation' && (
            <span className="rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
              На модерации
            </span>
          )}
        </div>

        <h1 className="mt-3 font-head text-[30px] font-extrabold leading-tight md:text-[36px]">
          {article.title}
        </h1>

        <div className="mt-4 flex items-center gap-3 text-[14px] text-muted-foreground">
          <Link
            to={`/authors/${article.authorId}`}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground"
          >
            <Icon name="User" size={15} />
          </Link>
          <Link to={`/authors/${article.authorId}`} className="font-medium text-foreground hover:text-primary">
            {article.author}
          </Link>
          <span>·</span>
          <span>{article.date}</span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <Icon name="Eye" size={14} />
            {article.views}
          </span>
        </div>

        <div className="mt-8 space-y-4 text-[17px] leading-[1.75] text-foreground">
          {article.body.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>

        {authorArticles.length > 0 && (
          <div className="mt-14 border-t border-border pt-8">
            <h2 className="font-head text-[20px] font-bold">Ещё статьи автора</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {authorArticles.slice(0, 4).map((a) => (
                <Link
                  key={a.id}
                  to={`/journal/${a.id}`}
                  className="flex gap-3 rounded-xl border border-border p-3 transition-colors hover:border-primary"
                >
                  <img src={a.cover} alt="" className="h-16 w-16 flex-none rounded-lg object-cover" />
                  <div className="min-w-0">
                    <div className="line-clamp-2 text-[14px] font-bold leading-snug">{a.title}</div>
                    <div className="mt-1 text-[12px] text-muted-foreground">{a.date}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ArticlePage;
