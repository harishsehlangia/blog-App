import axios from "axios";
import { lookInSession } from "./session";

export const uploadImage = async (img) => {

    let imgURL = null;

    // Get access token from session for authenticated uploads
    const userSession = lookInSession("user");
    const access_token = userSession ? JSON.parse(userSession).access_token : null;

    await axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url", {
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
    .then( async ({ data: { uploadURL } }) => {
        await axios({
            method: 'PUT',
            url: uploadURL,
            headers: { 'content-Type': 'multipart/form-data' },
            data: img
        })
        .then(() => {
            imgURL = uploadURL.split("?")[0]
        })
    })

    return imgURL;

}