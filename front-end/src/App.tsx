import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/layout";
import { Dashboard } from "./features/movies/pages/dashboard";
import { DataManagement } from "./features/movies/pages/data-management";
import { Attribution } from "./pages/attribution";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="data" element={<DataManagement />} />
          <Route path="attribution" element={<Attribution />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
