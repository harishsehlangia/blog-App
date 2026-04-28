import Icon from "./Icon";

const NoDataMessage = ({ message }) => {

    return(
        <div className="text-center w-full py-10 mt-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-grey flex items-center justify-center">
                <Icon name="inbox" className="text-3xl text-dark-grey" />
            </div>
            <p className="text-dark-grey text-xl font-medium">{ message }</p>
            <p className="text-dark-grey/60 text-sm mt-1">Check back later for new content</p>
        </div>
    )

}

export default NoDataMessage;