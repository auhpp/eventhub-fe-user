import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import DefaultLayout from "@/layouts/DefaultLayout"
import DefaultNoneFooterLayout from "@/layouts/DefaultNoneFooterLayout"
import EventManagementLayout from "@/layouts/EventManagementLayout"
import OrganizerLayout from "@/layouts/OrganizerLayout"
import ProfileLayout from "@/layouts/ProfileLayout"
import AttendeeManagementPage from "@/pages/AttendeeManagementPage"
import ChangePasswordPage from "@/pages/ChangePasswordPage"
import CreateEventPage from "@/pages/CreateEventPage"
import CreateOrganizerRequestPage from "@/pages/CreateOrganizerRequestPage"
import EditEventPage from "@/pages/EditEventPage"
import EditProfilePage from "@/pages/EditProfilePage"
import EventDetailPage from "@/pages/EventDetailPage"
import EventGalleryPage from "@/pages/EventGalleryPage"
import EventManagementPage from "@/pages/EventManagementPage"
import EventOverviewPage from "@/pages/EventOverviewPage"
import EventStaffManagementPage from "@/pages/EventStaffManagementPage"
import HomePage from "@/pages/HomePage"
import InvitationResponsePage from "@/pages/InvitationResponsePage"
import MyTicketPage from "@/pages/MyTicketPage"
import OrderDetailPage from "@/pages/OrderDetailPage"
import OrderHistoryPage from "@/pages/OrderHistoryPage"
import OrganizerRequestDetail from "@/pages/OrganizerRequestDetailPage"
import OrganizerRequestPage from "@/pages/OrganizerRequestPage"
import PaymentCallbackPage from "@/pages/PaymentCallbackPage"
import PaymentPage from "@/pages/PaymentPage"
import SigninPage from "@/pages/SigninPage"
import SignupPage from "@/pages/SignupPage"
import StaffInvitationResponsePage from "@/pages/StaffInvitationResponsePage"
import TicketDetailPage from "@/pages/TicketDetailPage"
import TicketGiftConfirmPage from "@/pages/TicketGiftConfirmPage"
import TicketGiftDetailPage from "@/pages/TicketGiftDetailPage"
import TicketGiftSelectionPage from "@/pages/TicketGiftSelectionPage"
import TicketGiftsPage from "@/pages/TicketGiftsPage"
import TicketRecipientPage from "@/pages/TicketRecipientPage"
import TicketSelectionPage from "@/pages/TicketSelectionPage"

export const publicRoutes = [
    { path: routes.signin, page: SigninPage, layout: AuthLayout },
    { path: routes.signup, page: SignupPage, layout: AuthLayout },
    { path: routes.home, page: HomePage, layout: DefaultLayout },
    { path: routes.eventDetail, page: EventDetailPage, layout: DefaultLayout },
    { path: routes.invitationResponse, page: InvitationResponsePage, layout: DefaultLayout },
    { path: routes.staffInvitationResponse, page: StaffInvitationResponsePage, layout: DefaultLayout },
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
    { path: routes.profile, page: EditProfilePage, layout: ProfileLayout },
    { path: routes.changePassword, page: ChangePasswordPage, layout: ProfileLayout },
    { path: routes.updateOrganizerRegistration, page: CreateOrganizerRequestPage, layout: ProfileLayout },
    { path: routes.ticketGiftSelection, page: TicketGiftSelectionPage, layout: ProfileLayout },
    { path: routes.ticketGiftReceiver, page: TicketRecipientPage, layout: ProfileLayout },
    { path: routes.ticketGiftConfirm, page: TicketGiftConfirmPage, layout: ProfileLayout },
    { path: routes.ticketGifts, page: TicketGiftsPage, layout: ProfileLayout },
    { path: routes.ticketGiftDetail, page: TicketGiftDetailPage, layout: ProfileLayout },

]
export const organizerRoutes = [
    { path: routes.eventManagement, page: EventManagementPage, layout: OrganizerLayout },
    { path: routes.createEvent, page: CreateEventPage, layout: OrganizerLayout },
    { path: routes.eventOverview, page: EventOverviewPage, layout: EventManagementLayout },
    { path: routes.eventAttendee, page: AttendeeManagementPage, layout: EventManagementLayout },
    { path: routes.editEvent, page: EditEventPage, layout: EventManagementLayout },
    { path: routes.eventStaffManagement, page: EventStaffManagementPage, layout: EventManagementLayout },
    { path: routes.eventGallery, page: EventGalleryPage, layout: EventManagementLayout },


]
