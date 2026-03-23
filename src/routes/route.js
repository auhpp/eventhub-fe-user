import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import DefaultLayout from "@/layouts/DefaultLayout"
import DefaultNoneFooterLayout from "@/layouts/DefaultNoneFooterLayout"
import EventManagementLayout from "@/layouts/EventManagementLayout"
import EventSeriesManagementLayout from "@/layouts/EventSeriesManagementLayout"
import OrganizerLayout from "@/layouts/OrganizerLayout"
import ProfileLayout from "@/layouts/ProfileLayout"
import AttendeeManagementPage from "@/pages/AttendeeManagementPage"
import CategoryDetail from "@/pages/CategoryDetail"
import ChangePasswordPage from "@/pages/ChangePasswordPage"
import CheckInReportPage from "@/pages/CheckInReportPage"
import CreateEventPage from "@/pages/CreateEventPage"
import CreateEventSeriesPage from "@/pages/CreateEventSeriesPage"
import CreateOrganizerRequestPage from "@/pages/CreateOrganizerRequestPage"
import CreateVoucherPage from "@/pages/CreateVoucherPage"
import EditEventPage from "@/pages/EditEventPage"
import EditProfilePage from "@/pages/EditProfilePage"
import EditVoucherPage from "@/pages/EditVoucherPage"
import EventDetailPage from "@/pages/EventDetailPage"
import EventGalleryPage from "@/pages/EventGalleryPage"
import EventManagementPage from "@/pages/EventManagementPage"
import EditEventSeriesPage from "@/pages/eventSeries/EditEventSeriesPage"
import EventsInEventSeriesPage from "@/pages/eventSeries/EventsInEventSeriesPage"
import EventSeriesDetailPage from "@/pages/EventSeriesDetailPage"
import EvenSeriesManagementPage from "@/pages/EventSeriesManagementPage"
import EventSeriesPage from "@/pages/EventSeriesPage"
import EventStaffManagementPage from "@/pages/EventStaffManagementPage"
import EventStatisticsPage from "@/pages/EventStatisticsPage"
import HomePage from "@/pages/HomePage"
import InvitationResponsePage from "@/pages/InvitationResponsePage"
import MyTicketPage from "@/pages/MyTicketPage"
import NotificationPage from "@/pages/NotificationPage"
import OrderDetailPage from "@/pages/OrderDetailPage"
import OrderHistoryPage from "@/pages/OrderHistoryPage"
import OrderManagement from "@/pages/OrderManagementPage"
import OrganizerRequestDetail from "@/pages/OrganizerRequestDetailPage"
import OrganizerRequestPage from "@/pages/OrganizerRequestPage"
import PaymentCallbackPage from "@/pages/PaymentCallbackPage"
import PaymentPage from "@/pages/PaymentPage"
import SearchEventPage from "@/pages/SearchEventPage"
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
import VoucherManagementPage from "@/pages/VoucherManagementPage"
import CreateResaleTicketPage from "@/pages/CreateResaleTicketPage"
import ResaleTicketPage from "@/pages/ResaleTicketPage"
import ResaleDetailPage from "@/pages/ResaleDetailPage"
import ResalePage from "@/pages/ResalePage"
import EventResalePage from "@/pages/EventResalePage"
import ResaleTicketSelectionPage from "@/pages/ResaleTicketSelectionPage"
import EditResaleTicketPage from "@/pages/EditResaleTicketPage"

export const publicRoutes = [
    { path: routes.signin, page: SigninPage, layout: AuthLayout },
    { path: routes.signup, page: SignupPage, layout: AuthLayout },
    { path: routes.home, page: HomePage, layout: DefaultLayout },
    { path: routes.eventDetail, page: EventDetailPage, layout: DefaultLayout },
    { path: routes.invitationResponse, page: InvitationResponsePage, layout: DefaultLayout },
    { path: routes.staffInvitationResponse, page: StaffInvitationResponsePage, layout: DefaultLayout },
    { path: routes.search, page: SearchEventPage, layout: DefaultLayout },
    { path: routes.categoryDetail, page: CategoryDetail, layout: DefaultLayout },
    { path: routes.eventSeriesDetail, page: EventSeriesDetailPage, layout: DefaultLayout },
    { path: routes.eventSeries, page: EventSeriesPage, layout: DefaultLayout },

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
    { path: routes.notification, page: NotificationPage, layout: DefaultLayout },
    { path: routes.createResale, page: CreateResaleTicketPage, layout: DefaultLayout },
    { path: routes.resaleProfile, page: ResaleTicketPage, layout: ProfileLayout },
    { path: routes.resaleDetailProfile, page: ResaleDetailPage, layout: ProfileLayout },
    { path: routes.resale, page: ResalePage, layout: DefaultLayout },
    { path: routes.resaleEvent, page: EventResalePage, layout: DefaultLayout },
    { path: routes.attendeeSelection, page: ResaleTicketSelectionPage, layout: DefaultLayout },
    { path: routes.editResalePost, page: EditResaleTicketPage, layout: DefaultLayout },


]
export const organizerRoutes = [
    { path: routes.eventManagement, page: EventManagementPage, layout: OrganizerLayout },
    { path: routes.createEvent, page: CreateEventPage, layout: OrganizerLayout },
    { path: routes.eventOverview, page: EventStatisticsPage, layout: EventManagementLayout },
    { path: routes.eventAttendee, page: AttendeeManagementPage, layout: EventManagementLayout },
    { path: routes.editEvent, page: EditEventPage, layout: EventManagementLayout },
    { path: routes.eventStaffManagement, page: EventStaffManagementPage, layout: EventManagementLayout },
    { path: routes.eventGallery, page: EventGalleryPage, layout: EventManagementLayout },
    { path: routes.eventOrder, page: OrderManagement, layout: EventManagementLayout },
    { path: routes.createVoucher, page: CreateVoucherPage, layout: EventManagementLayout },
    { path: routes.voucher, page: VoucherManagementPage, layout: EventManagementLayout },
    { path: routes.checkIn, page: CheckInReportPage, layout: EventManagementLayout },
    { path: routes.orderDetailOrganizer, page: OrderDetailPage, layout: EventManagementLayout },
    { path: routes.editVoucher, page: EditVoucherPage, layout: EventManagementLayout },
    { path: routes.createEventSeries, page: CreateEventSeriesPage, layout: OrganizerLayout },
    { path: routes.eventSeriesManagement, page: EvenSeriesManagementPage, layout: OrganizerLayout },
    { path: routes.eventsInEventSeries, page: EventsInEventSeriesPage, layout: EventSeriesManagementLayout },
    { path: routes.editEventSeries, page: EditEventSeriesPage, layout: EventSeriesManagementLayout },


]
