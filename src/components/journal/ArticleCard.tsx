import Icon from '@/components/ui/icon';
import { Article } from '@/data/journal';

interface ArticleCardProps {
  article: Article;
  onClick?: () => void;
}

const ArticleCard = ({ article, onClick }: ArticleCardProps) => (
  <article
    className="group flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-[0_12px_34px_rgba(0,0,0,0.07)]"
    onClick={onClick}
  >
    <div className="overflow-hidden">
      <img
        src={article.cover}
        alt=""
        className="h-[210px] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
      />
    </div>
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center gap-2">
        <span className="soft-accent rounded-md px-2.5 py-1 text-[12px] font-medium">
          {article.category}
        </span>
        {article.status === 'moderation' && (
          <span className="rounded-md bg-muted px-2.5 py-1 text-[12px] font-medium text-muted-foreground">
            На модерации
          </span>
        )}
      </div>
      <h3 className="mt-3 font-head text-[20px] font-bold leading-[1.28]">{article.title}</h3>
      <p className="mt-2.5 line-clamp-3 text-[15px] leading-relaxed text-muted-foreground">
        {article.excerpt}
      </p>
      <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-[13px] text-muted-foreground">
        <span className="font-medium text-foreground">{article.author}</span>
        <span className="flex items-center gap-1.5">
          <Icon name="Eye" size={15} />
          {article.views}
        </span>
      </div>
    </div>
  </article>
);

export default ArticleCard;