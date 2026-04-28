import { useContext } from "react";
import { EditorContext } from "../pages/editor.pages";
import Icon from "./Icon";

const Tag = ({ tag, tagIndex }) => {

    let { blog, blog: { tags }, setBlog } = useContext(EditorContext)

    const handleTagDelete = () => {
        tags = tags.filter(t => t != tag );
        setBlog({ ...blog, tags })
    }

    const handleTagEdit = (e) => {
        if(e.keyCode == 13 || e.keyCode == 188){
            e.preventDefault();

            let currentTag = e.target.innerText;

            tags[tagIndex] = currentTag;

            setBlog({ ...blog, tags })

            e.target.setAttribute("contentEditable", false);
        }
    }

    const addEditable = (e) => {
        e.target.setAttribute("contentEditable", true);
        e.target.focus();
    }

    return(
        <div className="relative p-2 mt-2 mr-2 px-5 bg-white rounded-full inline-block hover:bg-grey/50 pr-10 border border-border transition-colors">

            <p className="outline-none text-sm" onKeyDown={handleTagEdit} onClick={addEditable}>{tag}</p>

            <button className="mt-[2px] rounded-full absolute right-2 top-1/2 -translate-y-1/2 text-dark-grey hover:text-red transition-colors"
                onClick={handleTagDelete}
            >
                <Icon name="close" className="text-xl pointer-events-none" />
            </button>

        </div>
    )
}

export default Tag;