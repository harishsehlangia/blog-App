let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

export const getDay = (timeStamp) => {
    let date = new Date(timeStamp);

    return `${date.getDate()} ${months[date.getMonth()]}`
}