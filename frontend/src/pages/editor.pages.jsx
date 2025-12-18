import { createContext, useContext, useState } from "react";
import { UserContext } from "../App";
import { Navigate } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";

const blogStructure = {
    title: "",
    banner: "",
    content: [],
    tags: [],
    des: "",
    author: { personal_info: { } }
}

export const EditorContext = createContext({ });

const Editor = () => {

    const [ blog, setBlog ] = useState(blogStructure);
    const [ editorState, setEditorState ] = useState("editor")
    
    let { userAuth: {access_token} } = useContext(UserContext);
    
    return(
        // by using this "EditorContext.Provider" now we can use all states "blog, setBlog, editorState, setEditorState" inside the "BlogEditor & PublishForm" components.
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState }}>
            {
                access_token === null ? <Navigate to="/signin" />
                : editorState == "editor" ? <BlogEditor/> : <PublishForm/>
            }
        </EditorContext.Provider>
    )
}

export default Editor;