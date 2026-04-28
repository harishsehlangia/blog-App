import Icon from "./Icon";

const LoadMoreDataBtn = ({ state, fetchDataFun, additionalParam }) => {

    if(state != null && state.totalDocs > state.results.length){

        return (
            <button
            onClick={() => fetchDataFun({ ...additionalParam, page: state.page + 1})}
            className="text-brand font-medium p-3 px-6 hover:bg-brand/5 rounded-full flex items-center gap-2 mx-auto mt-4 border border-brand/20 hover:border-brand/40 transition-all"
            >
                <span>Load More</span>
                <Icon name="expand_more" className="text-xl" />
            </button>
        )

    }

    
}

export default LoadMoreDataBtn;