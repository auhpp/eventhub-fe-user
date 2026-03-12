export const isExpiredEvent = ({ event }) => {
    var valid = true
    event.eventSessions.forEach(element => {
        if ((new Date(element.endDateTime)) > (new Date())) {
            valid = false;
            return false;
        }
    });
    return valid;
}

export const isExpiredEventSession = ({ endDateTime }) => {
    return (new Date(endDateTime) < (new Date()))
}

export const isExpiredEventSessionStartDate = ({ startDateTime }) => {
    return (new Date(startDateTime) < (new Date()))
}