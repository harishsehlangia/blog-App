import Notification from '../Schema/Notification.js';

// Check for new notifications (red dot)
export const newNotification = (req, res) => {

    let user_id = req.user;

    Notification.exists({ notification_for: user_id, seen: false, user: { $ne: user_id } })
    .then(result => {
        if(result){
            return res.status(200).json({ new_notification_available: true })
        } else{
            return res.status(200).json({ new_notification_available: false })
        }
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message })
    })

};

// Get notifications
export const getNotifications = (req, res) => {

    let user_id = req.user;

    let { page, filter, deletedDocCount } = req.body;

    let maxLimit = 10;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } }

    let skipDocs = (page - 1) * maxLimit;

    if(filter != 'all'){
        findQuery.type = filter;
    }

    if(deletedDocCount){
        skipDocs -= deletedDocCount;
    }

    Notification.find(findQuery)
    .skip(skipDocs)
    .limit(maxLimit)
    .populate("blog", "title blog_id")
    .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
    .populate("comment", "comment")
    .populate("replied_on_comment", "comment")
    .populate("reply", "comment")
    .sort({ createdAt: -1 })
    .select("createdAt type seen reply")
    .then(notifications => {

        // Mark fetched notifications as seen using their actual _ids
        // (updateMany doesn't support .skip()/.limit())
        let notificationIds = notifications.map(n => n._id);
        if (notificationIds.length) {
            Notification.updateMany({ _id: { $in: notificationIds } }, { seen: true })
            .then(() => console.log("notification seen"));
        }

        return res.status(200).json({ notifications })
    })
    .catch(err => {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    })

};

// All notifications count
export const allNotificationsCount = (req, res) => {

    let user_id = req.user;

    let { filter } = req.body;

    let findQuery = { notification_for: user_id, user: { $ne: user_id } }

    if(filter != 'all'){
        findQuery.type = filter;
    }

    Notification.countDocuments(findQuery)
    .then(count => {
        return res.status(200).json({ totalDocs: count });
    })
    .catch(err => {
        return res.status(500).json({error: err.message})
    })

};
