import _ from 'lodash';

export const loadState = () => {
    try {
        // Check to see when the localStorage support state was last updated. If it was more than one hour ago - delete it to start fresh
        let lastUpdated = localStorage.getItem('pixassist_last_updated'),
            now = new Date().getTime();

        if ( now > parseInt(lastUpdated) + 3600000) {
			clearState();
        }

        if ( _.get(pixassist,'todos.clearLocalStorage', false) ) {
			clearState();
			pixassist.todos.clearLocalStorage = false;
		}

        const serializedState = localStorage.getItem('pixassist_state');

        // If no state is found in local storage - return undefined to let our reducer initialize its default state
        if (!serializedState) {
            return undefined;
        }

        // If a state is found in local storage - return that state
        return JSON.parse(serializedState);
    } catch(err) {
        // In case of error just return undefined so the reducer does not get confused
        return undefined;
    }
};

export const saveState = (state) => {
    try {
        const serializedState = JSON.stringify(state);
        localStorage.setItem('pixassist_state', serializedState);
        // set a timestamp to know when the state was last updated
        let now = new Date().getTime().toString();
        localStorage.setItem('pixassist_last_updated', now);
    } catch(err) {
        console.log(err)
    }
}

export const clearState = () => {
	localStorage.removeItem('pixassist_state');
	localStorage.removeItem('pixassist_last_updated');
};
