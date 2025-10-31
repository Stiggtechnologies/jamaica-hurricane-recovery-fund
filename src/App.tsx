import { useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import Chatbot from './components/Chatbot';
import Home from './pages/Home';
import About from './pages/About';
import Impact from './pages/Impact';
import GetInvolved from './pages/GetInvolved';
import Donate from './pages/Donate';
import News from './pages/News';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Platform from './pages/Platform';
import Volunteers from './pages/Volunteers';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home onNavigate={setCurrentPage} />;
      case 'about':
        return <About />;
      case 'impact':
        return <Impact />;
      case 'get-involved':
        return <GetInvolved />;
      case 'donate':
        return <Donate />;
      case 'volunteers':
        return <Volunteers />;
      case 'platform':
        return <Platform />;
      case 'news':
        return <News />;
      case 'contact':
        return <Contact />;
      case 'admin':
        return <Admin />;
      default:
        return <Home onNavigate={setCurrentPage} />;
    }
  };

  if (currentPage === 'admin') {
    return <Admin />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header onNavigate={setCurrentPage} currentPage={currentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
      <Chatbot />
    </div>
  );
}

export default App;
