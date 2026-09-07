import { useState } from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Journal from '@/components/Journal';
import HowItWorks from '@/components/HowItWorks';
import Rules from '@/components/Rules';
import About from '@/components/About';
import Footer from '@/components/Footer';
import AuthDialog from '@/components/AuthDialog';
import CreateArticleDialog from '@/components/CreateArticleDialog';
import { Article } from '@/data/journal';
import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [user, setUser] = useState<string | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [drafts, setDrafts] = useState<Article[]>([]);

  const handleCreate = () => {
    if (!user) {
      setAuthOpen(true);
      toast({
        title: 'Нужен аккаунт',
        description: 'Войдите или зарегистрируйтесь, чтобы написать статью.',
      });
      return;
    }
    setCreateOpen(true);
  };

  const handleAuth = (name: string) => {
    setUser(name);
    toast({
      title: `Здравствуйте, ${name}`,
      description: 'Профиль создан, можно публиковать статьи.',
    });
  };

  const handleSubmit = (a: Article) => {
    setDrafts((p) => [a, ...p]);
    document.querySelector('#journal')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header
        user={user}
        onAuth={() => setAuthOpen(true)}
        onLogout={() => {
          setUser(null);
          toast({ title: 'Вы вышли из аккаунта' });
        }}
        onCreate={handleCreate}
      />
      <main>
        <Hero onCreate={handleCreate} />
        <Journal extra={drafts} />
        <HowItWorks onCreate={handleCreate} />
        <Rules />
        <About />
      </main>
      <Footer />

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} onSuccess={handleAuth} />
      <CreateArticleDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        author={user}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default Index;
