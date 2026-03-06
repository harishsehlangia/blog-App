import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { filterPaginationData } from "../common/filter-pagination-data";

const Notifications = () => {

    let { userAuth: { access_token } } = useContext(UserContext);

    const [ filter, setFilter ] = useState('all');
    const [ notifications, setNotifications ] = useState(null);

    let filters = ['all', 'like', 'comment', 'reply'];

    const fetchNotifications = ({ page, deletedDocCount=0 }) => {
        
        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/notifications", { page, filter, deletedDocCount }, {
            headers: {
                'Authorization': `Bearer ${access_token}`
            }
        })
        .then(async ({ data: { notifications: data } }) => {

            console.log(data);

            let formatedData = await filterPaginationData({
                state: notifications,
                data, page,
                countRoute: "/all-notifications-count",
                data_to_send: { filter },
                user: access_token
            })

            setNotifications(formatedData)
            console.log(formatedData);

        })
        .catch(err => {
            console.log(err);
        })

    }

    useEffect(() => {

        if(access_token){
            fetchNotifications({ page: 1 });
        }

    }, [access_token, filter])

    const handleFilter = (e) => {
        let btn = e.target;
        setFilter(btn.innerHTML);

        setNotifications(null);
    }

    return(
        <div>

            <h1 className="max-md:hidden">Recent Notifications</h1>

            <div className="my-8 flex gap-6">
                {
                    filters.map((filterName, i) => {
                        return <button 
                            key={i} 
                            className={"py-2 " + ( filter == filterName ? "btn-dark" : "btn-light")}
                            onClick={handleFilter}
                        >{filterName}</button>
                    })
                }
            </div>

        </div>
    )
}

export default Notifications;