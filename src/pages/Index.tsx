import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import Journal from '@/components/Journal';
import HowItWorks from '@/components/HowItWorks';
import Rules from '@/components/Rules';
import About from '@/components/About';
import Footer from '@/components/Footer';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate(isAuthenticated ? '/write' : '/auth');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <Header />
      <main>
        <Hero onCreate={handleCreate} />
        <Journal />
        <HowItWorks onCreate={handleCreate} />
        <Rules />
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
