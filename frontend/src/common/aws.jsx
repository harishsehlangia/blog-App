import api from "./api";

export const uploadImage = async (img) => {

    let imgURL = null;

    await api.get("/get-upload-url")
    .then( async ({ data: { uploadURL } }) => {
        await api({
            method: 'PUT',
            url: uploadURL,
            baseURL: '', // Override baseURL for direct S3 upload
            headers: { 'Content-Type': 'image/jpeg' },
            data: img
        })
        .then(() => {
            imgURL = uploadURL.split("?")[0]
        })
    })

    return imgURL;

}