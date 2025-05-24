import { Routes, Route } from "react-router-dom";
import Header from "./components/header/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import PlayersPage from "./pages/PlayersPage";
import GalleryPage from "./pages/GalleryPage";
import ProfilePage from "./pages/ProfilePage";
import SearchPage from "./pages/SearchPage";

function App() {
    return (
        <>
            <Header />
            <div className="app">
                <Routes>
                    <Route index path="/" element={<HomePage />} />
                    <Route path="/players" element={<PlayersPage />} />
                    <Route path="/gallery" element={<GalleryPage />} />
                    <Route path="/search" element={<SearchPage />} />
                    <Route path="/profiles/:id" element={<ProfilePage />} />
                </Routes>
            </div>
            <Footer />
        </>
    );
}

export default App
