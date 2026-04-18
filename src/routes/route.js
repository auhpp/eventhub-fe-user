import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import DefaultLayout from "@/layouts/DefaultLayout"
import DefaultNoneFooterLayout from "@/layouts/DefaultNoneFooterLayout"
import EventManagementLayout from "@/layouts/EventManagementLayout"
import EventSeriesManagementLayout from "@/layouts/EventSeriesManagementLayout"
import OrganizerLayout from "@/layouts/OrganizerLayout"
import ProfileLayout from "@/layouts/ProfileLayout"
import AttendeeManagementPage from "@/pages/eventManagement/AttendeeManagementPage"
import CategoryDetail from "@/pages/CategoryDetail"
import ChangePasswordPage from "@/pages/ChangePasswordPage"
import CheckInReportPage from "@/pages/eventManagement/CheckInReportPage"
import CreateEventPage from "@/pages/eventManagement/CreateEventPage"
import CreateEventSeriesPage from "@/pages/eventSeries/CreateEventSeriesPage"
import CreateOrganizerRequestPage from "@/pages/user/CreateOrganizerRequestPage"
import CreateVoucherPage from "@/pages/eventManagement/CreateVoucherPage"
import EditEventPage from "@/pages/eventManagement/EditEventPage"
import EditVoucherPage from "@/pages/eventManagement/EditVoucherPage"
import EventDetailPage from "@/pages/EventDetailPage"
import EventGalleryPage from "@/pages/eventManagement/EventGalleryPage"
import EventManagementPage from "@/pages/organizer/EventManagementPage"
import EditEventSeriesPage from "@/pages/eventSeries/EditEventSeriesPage"
import EventsInEventSeriesPage from "@/pages/eventSeries/EventsInEventSeriesPage"
import EventSeriesDetailPage from "@/pages/eventSeries/EventSeriesDetailPage"
import EvenSeriesManagementPage from "@/pages/organizer/EventSeriesManagementPage"
import EventSeriesPage from "@/pages/eventSeries/EventSeriesPage"
import EventStaffManagementPage from "@/pages/eventManagement/EventStaffManagementPage"
import EventStatisticsPage from "@/pages/eventManagement/EventStatisticsPage"
import HomePage from "@/pages/HomePage"
import InvitationResponsePage from "@/pages/InvitationResponsePage"
import MyTicketPage from "@/pages/user/MyTicketPage"
import NotificationPage from "@/pages/NotificationPage"
import OrderDetailPage from "@/pages/user/OrderDetailPage"
import OrderHistoryPage from "@/pages/user/OrderHistoryPage"
import OrderManagement from "@/pages/eventManagement/OrderManagementPage"
import OrganizerRequestDetail from "@/pages/user/OrganizerRequestDetailPage"
import OrganizerRequestPage from "@/pages/user/OrganizerRequestPage"
import PaymentCallbackPage from "@/pages/PaymentCallbackPage"
import PaymentPage from "@/pages/PaymentPage"
import SearchEventPage from "@/pages/SearchEventPage"
import SigninPage from "@/pages/auth/SigninPage"
import SignupPage from "@/pages/auth/SignupPage"
import StaffInvitationResponsePage from "@/pages/StaffInvitationResponsePage"
import TicketDetailPage from "@/pages/user/TicketDetailPage"
import TicketGiftConfirmPage from "@/pages/ticketGift/TicketGiftConfirmPage"
import TicketGiftDetailPage from "@/pages/ticketGift/TicketGiftDetailPage"
import TicketGiftSelectionPage from "@/pages/ticketGift/TicketGiftSelectionPage"
import TicketGiftsPage from "@/pages/ticketGift/TicketGiftsPage"
import TicketRecipientPage from "@/pages/ticketGift/TicketRecipientPage"
import TicketSelectionPage from "@/pages/TicketSelectionPage"
import VoucherManagementPage from "@/pages/eventManagement/VoucherManagementPage"
import CreateResaleTicketPage from "@/pages/resale/CreateResaleTicketPage"
import ResaleTicketPage from "@/pages/resale/ResaleTicketPage"
import ResaleDetailPage from "@/pages/resale/ResaleDetailPage"
import EventResalePage from "@/pages/EventResalePage"
import ResaleTicketSelectionPage from "@/pages/resale/ResaleTicketSelectionPage"
import EditResaleTicketPage from "@/pages/EditResaleTicketPage"
import ChatPage from "@/pages/ChatPage"
import FavoritePage from "@/pages/FavoritePage"
import QAPage from "@/pages/QAPage"
import QAOrganizerPage from "@/pages/eventManagement/QAOrganizerPage"
import OrganizerStatsPage from "@/pages/organizer/OrganizerStatsPage"
import ResellerRevenuePage from "@/pages/user/ResellerRevenuePage"
import WithdrawalRequestDetailPage from "@/pages/WithdrawalRequestDetailPage"
import OrganizerRevenuePage from "@/pages/OrganizerRevenuePage"
import EventSeriesStatsPage from "@/pages/eventSeries/EventSeriesStatsPage"
import Forbidden403 from "@/components/Forbidden403"
import AttendeeCheckInList from "@/pages/eventManagement/AttendeeCheckInListPage"
import UserSummaryBookingDetailPage from "@/pages/eventManagement/UserSummaryBookingDetailPage"
import UserProfilePage from "@/pages/user/UserProfilePage"
import ProfileLayoutPage from "@/pages/user/EditProfilePage"
import EventReviewsManagerPage from "@/pages/eventManagement/EventReviewsManagerPage"
import EventSeriesSearchPage from "@/pages/eventSeries/EventSeriesSearchPage"
import ResaleSearchPage from "@/pages/resale/ResaleSearchPage"
import EventTagSearchPage from "@/pages/EventTagSearchPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"

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
    { path: routes.forbidden, page: Forbidden403, layout: DefaultLayout },
    { path: routes.userProfileDetail, page: UserProfilePage, layout: DefaultLayout },
    { path: routes.resale, page: ResaleSearchPage, layout: DefaultLayout },
    { path: routes.resaleEvent, page: EventResalePage, layout: DefaultLayout },
    { path: routes.eventSeriesSearch, page: EventSeriesSearchPage, layout: DefaultLayout },
    { path: routes.eventTagSearch, page: EventTagSearchPage, layout: DefaultLayout },
    { path: routes.forgetPassword, page: ForgotPasswordPage, layout: AuthLayout },

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
    { path: routes.profile, page: ProfileLayoutPage, layout: ProfileLayout },
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
    { path: routes.attendeeSelection, page: ResaleTicketSelectionPage, layout: DefaultLayout },
    { path: routes.editResalePost, page: EditResaleTicketPage, layout: DefaultLayout },
    { path: routes.chat, page: ChatPage, layout: DefaultNoneFooterLayout },
    { path: routes.favorite, page: FavoritePage, layout: DefaultLayout },
    { path: routes.qa, page: QAPage, layout: DefaultNoneFooterLayout },
    { path: routes.resellerRevenue, page: ResellerRevenuePage, layout: ProfileLayout },
    { path: routes.withdrawalRequestDetail, page: WithdrawalRequestDetailPage, layout: ProfileLayout },


]
export const organizerRoutes = [
    { path: routes.eventManagement, page: EventManagementPage, layout: OrganizerLayout },
    { path: routes.createEvent, page: CreateEventPage, layout: OrganizerLayout },
    { path: routes.eventOverview, page: EventStatisticsPage, layout: EventManagementLayout },
    { path: routes.editEvent, page: EditEventPage, layout: EventManagementLayout },
    { path: routes.createVoucher, page: CreateVoucherPage, layout: EventManagementLayout },
    { path: routes.voucher, page: VoucherManagementPage, layout: EventManagementLayout },
    { path: routes.editVoucher, page: EditVoucherPage, layout: EventManagementLayout },
    { path: routes.createEventSeries, page: CreateEventSeriesPage, layout: OrganizerLayout },
    { path: routes.eventSeriesManagement, page: EvenSeriesManagementPage, layout: OrganizerLayout },
    { path: routes.eventsInEventSeries, page: EventsInEventSeriesPage, layout: EventSeriesManagementLayout },
    { path: routes.editEventSeries, page: EditEventSeriesPage, layout: EventSeriesManagementLayout },
    { path: routes.organizerStats, page: OrganizerStatsPage, layout: OrganizerLayout },
    { path: routes.organizerWithdrawalRequestDetail, page: WithdrawalRequestDetailPage, layout: OrganizerLayout },
    { path: routes.organzierRevenue, page: OrganizerRevenuePage, layout: OrganizerLayout },
    { path: routes.eventSeriesStats, page: EventSeriesStatsPage, layout: EventSeriesManagementLayout },

]


export const checkInStaffRoutes = [
    { path: routes.checkIn, page: CheckInReportPage, layout: EventManagementLayout },
    { path: routes.eventAttendee, page: AttendeeManagementPage, layout: EventManagementLayout },
    { path: routes.attendeeCheckInList, page: AttendeeCheckInList, layout: EventManagementLayout },
    { path: routes.userBookingDetail, page: UserSummaryBookingDetailPage, layout: EventManagementLayout },

]

export const eventManagerRoutes = [
    { path: routes.eventOrder, page: OrderManagement, layout: EventManagementLayout },
    { path: routes.orderDetailOrganizer, page: OrderDetailPage, layout: EventManagementLayout },
    { path: routes.eventStaffManagement, page: EventStaffManagementPage, layout: EventManagementLayout },
    { path: routes.eventGallery, page: EventGalleryPage, layout: EventManagementLayout },
    { path: routes.organizerQA, page: QAOrganizerPage, layout: EventManagementLayout },
    { path: routes.reviewManager, page: EventReviewsManagerPage, layout: EventManagementLayout },

]