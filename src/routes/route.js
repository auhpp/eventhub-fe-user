import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import DefaultLayout from "@/layouts/DefaultLayout"
import DefaultNoneFooterLayout from "@/layouts/DefaultNoneFooterLayout"
import EventManagementLayout from "@/layouts/EventManagementLayout"
import EventSeriesManagementLayout from "@/layouts/EventSeriesManagementLayout"
import OrganizerLayout from "@/layouts/OrganizerLayout"
import ProfileLayout from "@/layouts/ProfileLayout"
import AttendeeManagementPage from "@/pages/attendee/AttendeeManagementPage"
import CategoryDetail from "@/pages/CategoryDetail"
import ChangePasswordPage from "@/pages/user/ChangePasswordPage"
import CheckInReportPage from "@/pages/attendee/CheckInReportPage"
import CreateEventPage from "@/pages/event/CreateEventPage"
import CreateEventSeriesPage from "@/pages/eventSeries/CreateEventSeriesPage"
import CreateOrganizerRequestPage from "@/pages/organizerRequest/CreateOrganizerRequestPage"
import CreateVoucherPage from "@/pages/voucher/CreateVoucherPage"
import EditEventPage from "@/pages/event/EditEventPage"
import EditVoucherPage from "@/pages/voucher/EditVoucherPage"
import EventDetailPage from "@/pages/event/EventDetailPage"
import EventGalleryPage from "@/pages/EventGalleryPage"
import EventManagementPage from "@/pages/event/EventManagementPage"
import EditEventSeriesPage from "@/pages/eventSeries/EditEventSeriesPage"
import EventsInEventSeriesPage from "@/pages/eventSeries/EventsInEventSeriesPage"
import EventSeriesDetailPage from "@/pages/eventSeries/EventSeriesDetailPage"
import EvenSeriesManagementPage from "@/pages/eventSeries/EventSeriesManagementPage"
import EventSeriesPage from "@/pages/eventSeries/EventSeriesPage"
import EventStaffManagementPage from "@/pages/EventStaffManagementPage"
import EventStatisticsPage from "@/pages/event/EventStatisticsPage"
import HomePage from "@/pages/HomePage"
import InvitationResponsePage from "@/pages/InvitationResponsePage"
import MyTicketPage from "@/pages/ticket/MyTicketPage"
import NotificationPage from "@/pages/NotificationPage"
import OrderDetailPage from "@/pages/order/OrderDetailPage"
import OrderHistoryPage from "@/pages/order/OrderHistoryPage"
import OrderManagement from "@/pages/order/OrderManagementPage"
import OrganizerRequestDetail from "@/pages/organizerRequest/OrganizerRequestDetailPage"
import OrganizerRequestPage from "@/pages/organizerRequest/OrganizerRequestPage"
import PaymentCallbackPage from "@/pages/payment/PaymentCallbackPage"
import PaymentPage from "@/pages/payment/PaymentPage"
import SearchEventPage from "@/pages/event/SearchEventPage"
import SigninPage from "@/pages/auth/SigninPage"
import SignupPage from "@/pages/auth/SignupPage"
import StaffInvitationResponsePage from "@/pages/StaffInvitationResponsePage"
import TicketDetailPage from "@/pages/ticket/TicketDetailPage"
import TicketGiftConfirmPage from "@/pages/ticketGift/TicketGiftConfirmPage"
import TicketGiftDetailPage from "@/pages/ticketGift/TicketGiftDetailPage"
import TicketGiftSelectionPage from "@/pages/ticketGift/TicketGiftSelectionPage"
import TicketGiftsPage from "@/pages/ticketGift/TicketGiftsPage"
import TicketRecipientPage from "@/pages/ticketGift/TicketRecipientPage"
import TicketSelectionPage from "@/pages/payment/TicketSelectionPage"
import VoucherManagementPage from "@/pages/voucher/VoucherManagementPage"
import CreateResaleTicketPage from "@/pages/resale/CreateResaleTicketPage"
import ResaleTicketPage from "@/pages/resale/ResaleTicketPage"
import ResaleDetailPage from "@/pages/resale/ResaleDetailPage"
import EventResalePage from "@/pages/resale/EventResalePage"
import ResaleTicketSelectionPage from "@/pages/payment/ResaleTicketSelectionPage"
import EditResaleTicketPage from "@/pages/resale/EditResaleTicketPage"
import ChatPage from "@/pages/ChatPage"
import FavoritePage from "@/pages/FavoritePage"
import QAPage from "@/pages/qa/QAPage"
import QAOrganizerPage from "@/pages/qa/QAOrganizerPage"
import OrganizerStatsPage from "@/pages/OrganizerStatsPage"
import ResellerRevenuePage from "@/pages/revenue/ResellerRevenuePage"
import WithdrawalRequestDetailPage from "@/pages/WithdrawalRequestDetailPage"
import OrganizerRevenuePage from "@/pages/revenue/OrganizerRevenuePage"
import EventSeriesStatsPage from "@/pages/eventSeries/EventSeriesStatsPage"
import Forbidden403 from "@/components/Forbidden403"
import AttendeeCheckInList from "@/pages/attendee/AttendeeCheckInListPage"
import UserSummaryBookingDetailPage from "@/pages/order/UserSummaryBookingDetailPage"
import UserProfilePage from "@/pages/user/UserProfilePage"
import ProfileLayoutPage from "@/pages/user/EditProfilePage"
import EventReviewsManagerPage from "@/pages/review/EventReviewsManagerPage"
import EventSeriesSearchPage from "@/pages/eventSeries/EventSeriesSearchPage"
import ResaleSearchPage from "@/pages/resale/ResaleSearchPage"
import EventTagSearchPage from "@/pages/EventTagSearchPage"
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage"
import OrganizerReviewsPage from "@/pages/review/OrganizerReviewsPage"

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
    { path: routes.organizerReview, page: OrganizerReviewsPage, layout: DefaultLayout },

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