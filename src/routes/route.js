import { routes } from "@/config/routes"
import AuthLayout from "@/layouts/AuthLayout"
import SigninPage from "@/pages/SigninPage"
import SignupPage from "@/pages/SignupPage"

export const publicRoutes = [
    { path: routes.signin, page: SigninPage, layout: AuthLayout },
    { path: routes.signup, page: SignupPage, layout: AuthLayout },


]
export const privateRoutes = []
export const adminRoutes = []
