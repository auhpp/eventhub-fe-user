import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import DefaultLayout from "@/layouts/DefaultLayout"
import ProfileLayout from "@/layouts/ProfileLayout"
import CreateOrganizerRequestPage from "@/pages/CreateOrganizerRequestPage"
import HomePage from "@/pages/HomePage"
import OrganizerRequestDetail from "@/pages/OrganizerRequestDetailPage"
import OrganizerRequestPage from "@/pages/OrganizerRequestPage"
import SigninPage from "@/pages/SigninPage"
import SignupPage from "@/pages/SignupPage"

export const publicRoutes = [
    { path: routes.signin, page: SigninPage, layout: AuthLayout },
    { path: routes.signup, page: SignupPage, layout: AuthLayout },
    { path: routes.home, page: HomePage, layout: DefaultLayout },
    { path: routes.organizerRegistration, page: OrganizerRequestPage, layout: ProfileLayout },
    { path: routes.createOrganizerRegistration, page: CreateOrganizerRequestPage, layout: ProfileLayout },
    { path: routes.organizerRegistrationDetail, page: OrganizerRequestDetail, layout: ProfileLayout },
]
export const privateRoutes = []
export const adminRoutes = []
