import axios from "axios";
import api from "./api";

export const uploadImage = async (img) => {

    let imgURL = null;

    await api.get("/get-upload-url")
    .then( async ({ data: { uploadURL } }) => {
        // Use raw axios for S3 — NOT the `api` instance,
        // because the interceptor adds a JWT Authorization header
        // that conflicts with S3's presigned URL authentication.
        await axios({
            method: 'PUT',
            url: uploadURL,
            headers: { 'Content-Type': 'image/jpeg' },
            data: img
        })
        .then(() => {
            imgURL = uploadURL.split("?")[0]
        })
    })

    return imgURL;

}