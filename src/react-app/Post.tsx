import style from "./Posts.module.css";
import { useParams } from "react-router-dom";
import Topbar from "./Topbar";

function Posts() {
    const p = useParams();
    return (
        <>
            <div className="Post">
                <Topbar />
                <div className={style.postContainer}>
                    <p>게시글 id: {p.id}</p>
                </div>
            </div>
        </>
    );
}

export default Posts;