import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Mainmenu from "./Mainmenu.tsx";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./Login.tsx";
import Signin from "./Signin.tsx";
import Welcome from "./Welcome.tsx";
import User from "./User.tsx";
import AI from "./AI.tsx";
import Posts from "./Posts.tsx";
import Post from "./Post.tsx";
import Guide from "./Guide.tsx";
import Guides from "./Guides.tsx";
import Chat from "./Chat.tsx";
import ScrollToTop from "./ScrollToTop.tsx";
import Manager from "./Manager.tsx";

// 커스텀 훅: 페이지 이동 시마다 JWT 인증
function useJwtAuthOnRouteChange() {
    const location = useLocation();
    useEffect(() => {
        const authenticateJWT = async () => {
            const jwtToken = localStorage.getItem("token");
            if (!jwtToken) {
                return;
            }
            try {
                const response = await fetch("/api/extend-jwt", {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ token: jwtToken }),
                });
                const data = await response.json();
                if (data.success && data.token) {
                    localStorage.setItem("token", data.token); // JWT만 저장
                } else {
                    // 실패 시 기존 동작
                }
            } catch (error) {
            }
        };
        authenticateJWT();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location.pathname]);
}

function AppWithJwtAuth() {
    useJwtAuthOnRouteChange();
    return (
        <>
            <ScrollToTop />
            <Routes>
                <Route path="/" element={<Mainmenu />} />
                <Route path="/app" element={<App />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signin />} />
                <Route path="/welcome" element={<Welcome />} />
                <Route path="/user/:id" element={<User />} />
                <Route path="/ai" element={<AI />} />
                <Route path="/posts" element={<Posts />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/guide/view/:id" element={<User />} />
                <Route path="/guide/:id" element={<Guide />} />
                <Route path="/guides" element={<Guides />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/manager" element={<Manager />} />
                <Route path="/profile" element={<User />} />
                <Route path="*" element={<div>Not Found</div>} />
            </Routes>
        </>
    );
}

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <AppWithJwtAuth />
        </BrowserRouter>
    </StrictMode>
);