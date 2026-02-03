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

export const isExpiredEventSession = ({ eventSession }) => {
    return (new Date(eventSession.endTime) < (new Date()))
}