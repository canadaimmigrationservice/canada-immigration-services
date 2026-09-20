import { Routes, Route } from "react-router-dom";

function Home() {
  return (
    <main>
      <h1>Canada Immigration Services</h1>
      <p>
        Welcome to Canada Immigration Services.
      </p>
    </main>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

export default App;
