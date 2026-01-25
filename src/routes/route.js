import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import DefaultLayout from "@/layouts/DefaultLayout"
import DefaultNoneFooterLayout from "@/layouts/DefaultNoneFooterLayout"
import OrganizerLayout from "@/layouts/OrganizerLayout"
import ProfileLayout from "@/layouts/ProfileLayout"
import CreateEventPage from "@/pages/CreateEventPage"
import CreateOrganizerRequestPage from "@/pages/CreateOrganizerRequestPage"
import EventDetailPage from "@/pages/EventDetailPage"
import EventManagementPage from "@/pages/EventManagementPage"
import HomePage from "@/pages/HomePage"
import MyTicketPage from "@/pages/MyTicketPage"
import OrderDetailPage from "@/pages/OrderDetailPage"
import OrderHistoryPage from "@/pages/OrderHistoryPage"
import OrganizerRequestDetail from "@/pages/OrganizerRequestDetailPage"
import OrganizerRequestPage from "@/pages/OrganizerRequestPage"
import PaymentCallbackPage from "@/pages/PaymentCallbackPage"
import PaymentPage from "@/pages/PaymentPage"
import SigninPage from "@/pages/SigninPage"
import SignupPage from "@/pages/SignupPage"
import TicketDetailPage from "@/pages/TicketDetailPage"
import TicketSelectionPage from "@/pages/TicketSelectionPage"

export const publicRoutes = [
    { path: routes.signin, page: SigninPage, layout: AuthLayout },
    { path: routes.signup, page: SignupPage, layout: AuthLayout },
    { path: routes.home, page: HomePage, layout: DefaultLayout },
    { path: routes.eventDetail, page: EventDetailPage, layout: DefaultLayout },

]
export const privateRoutes = [
    { path: routes.organizerRegistration, page: OrganizerRequestPage, layout: ProfileLayout },
    { path: routes.createOrganizerRegistration, page: CreateOrganizerRequestPage, layout: ProfileLayout },
    { path: routes.organizerRegistrationDetail, page: OrganizerRequestDetail, layout: ProfileLayout },
    { path: routes.organizerRegistrationDetail, page: OrganizerRequestDetail, layout: ProfileLayout },
    { path: routes.selectTicket, page: TicketSelectionPage, layout: DefaultNoneFooterLayout },
    { path: routes.payment, page: PaymentPage, layout: DefaultNoneFooterLayout },
    { path: routes.paymentCallback, page: PaymentCallbackPage, layout: DefaultLayout },
    { path: routes.myTicket, page: MyTicketPage, layout: ProfileLayout },
    { path: routes.order, page: OrderHistoryPage, layout: ProfileLayout },
    { path: routes.orderDetail, page: OrderDetailPage, layout: ProfileLayout },
    { path: routes.ticketDetail, page: TicketDetailPage, layout: ProfileLayout },


]
export const organizerRoutes = [
    { path: routes.eventManagement, page: EventManagementPage, layout: OrganizerLayout },
    { path: routes.createEvent, page: CreateEventPage, layout: OrganizerLayout },
]
