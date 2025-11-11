import './App.css';
import NavBar from './components/NavBar';
import Intro from './components/Intro';
import ChatBot from './components/ChatBot';
import BMICalculator from './components/BMICalculator';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <NavBar />
      <Intro/>
      <ChatBot/>
      <BMICalculator/>
      <Footer/>
    </>
  );
}

export default App;
