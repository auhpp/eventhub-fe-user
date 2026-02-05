import { AvatarFallback, AvatarImage } from "./ui/avatar"
import BoringAvatar from "boring-avatars";

const DefaultAvatar = ({ user }) => {
    return (
        <>
            <AvatarImage src={user.avatar} alt={user.fullName} />
            <AvatarFallback>
                <BoringAvatar
                    size="100%"
                    name={user.email}
                    variant="marble"
                />
            </AvatarFallback>
        </>
    )
}

export default DefaultAvatar