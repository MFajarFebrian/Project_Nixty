
import type { DefineComponent, SlotsType } from 'vue'
type IslandComponent<T extends DefineComponent> = T & DefineComponent<{}, {refresh: () => Promise<void>}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, SlotsType<{ fallback: { error: unknown } }>>
type HydrationStrategies = {
  hydrateOnVisible?: IntersectionObserverInit | true
  hydrateOnIdle?: number | true
  hydrateOnInteraction?: keyof HTMLElementEventMap | Array<keyof HTMLElementEventMap> | true
  hydrateOnMediaQuery?: string
  hydrateAfter?: number
  hydrateWhen?: boolean
  hydrateNever?: true
}
type LazyComponent<T> = (T & DefineComponent<HydrationStrategies, {}, {}, {}, {}, {}, {}, { hydrated: () => void }>)
interface _GlobalComponents {
      'AddLicense': typeof import("../components/AddLicense.vue")['default']
    'AddProduct': typeof import("../components/AddProduct.vue")['default']
    'AppHeader': typeof import("../components/AppHeader.vue")['default']
    'AppHeaderCore': typeof import("../components/AppHeaderCore.vue")['default']
    'AuthModal': typeof import("../components/AuthModal.vue")['default']
    'CategoryCard': typeof import("../components/CategoryCard.vue")['default']
    'GoogleButton': typeof import("../components/GoogleButton.vue")['default']
    'InfoSection': typeof import("../components/InfoSection.vue")['default']
    'LogoutButton': typeof import("../components/LogoutButton.vue")['default']
    'MidtransStatusChecker': typeof import("../components/MidtransStatusChecker.vue")['default']
    'ProductCard': typeof import("../components/ProductCard.vue")['default']
    'ProfilePicture': typeof import("../components/ProfilePicture.vue")['default']
    'ToastNotifications': typeof import("../components/ToastNotifications.vue")['default']
    'AdminConfirmModal': typeof import("../components/admin/ConfirmModal.vue")['default']
    'AdminCustomSelect': typeof import("../components/admin/CustomSelect.vue")['default']
    'AdminImageUpload': typeof import("../components/admin/ImageUpload.vue")['default']
    'AdminImageUploadModal': typeof import("../components/admin/ImageUploadModal.vue")['default']
    'AdminRecordModal': typeof import("../components/admin/RecordModal.vue")['default']
    'AdminStockDisplay': typeof import("../components/admin/StockDisplay.vue")['default']
    'AdminStockManagement': typeof import("../components/admin/StockManagement.vue")['default']
    'AdminStockOverview': typeof import("../components/admin/StockOverview.vue")['default']
    'AdminToastNotifications': typeof import("../components/admin/ToastNotifications.vue")['default']
    'AdminTransactionChart': typeof import("../components/admin/TransactionChart.vue")['default']
    'NuxtWelcome': typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
    'NuxtLayout': typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
    'NuxtErrorBoundary': typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
    'ClientOnly': typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
    'DevOnly': typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
    'ServerPlaceholder': typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
    'NuxtLink': typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
    'NuxtLoadingIndicator': typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
    'NuxtTime': typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
    'NuxtRouteAnnouncer': typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
    'NuxtImg': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
    'NuxtPicture': typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
    'NuxtPage': typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
    'NoScript': typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
    'Link': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
    'Base': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
    'Title': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
    'Meta': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
    'Style': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
    'Head': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
    'Html': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
    'Body': typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
    'NuxtIsland': typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
    'NuxtRouteAnnouncer': IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
      'LazyAddLicense': LazyComponent<typeof import("../components/AddLicense.vue")['default']>
    'LazyAddProduct': LazyComponent<typeof import("../components/AddProduct.vue")['default']>
    'LazyAppHeader': LazyComponent<typeof import("../components/AppHeader.vue")['default']>
    'LazyAppHeaderCore': LazyComponent<typeof import("../components/AppHeaderCore.vue")['default']>
    'LazyAuthModal': LazyComponent<typeof import("../components/AuthModal.vue")['default']>
    'LazyCategoryCard': LazyComponent<typeof import("../components/CategoryCard.vue")['default']>
    'LazyGoogleButton': LazyComponent<typeof import("../components/GoogleButton.vue")['default']>
    'LazyInfoSection': LazyComponent<typeof import("../components/InfoSection.vue")['default']>
    'LazyLogoutButton': LazyComponent<typeof import("../components/LogoutButton.vue")['default']>
    'LazyMidtransStatusChecker': LazyComponent<typeof import("../components/MidtransStatusChecker.vue")['default']>
    'LazyProductCard': LazyComponent<typeof import("../components/ProductCard.vue")['default']>
    'LazyProfilePicture': LazyComponent<typeof import("../components/ProfilePicture.vue")['default']>
    'LazyToastNotifications': LazyComponent<typeof import("../components/ToastNotifications.vue")['default']>
    'LazyAdminConfirmModal': LazyComponent<typeof import("../components/admin/ConfirmModal.vue")['default']>
    'LazyAdminCustomSelect': LazyComponent<typeof import("../components/admin/CustomSelect.vue")['default']>
    'LazyAdminImageUpload': LazyComponent<typeof import("../components/admin/ImageUpload.vue")['default']>
    'LazyAdminImageUploadModal': LazyComponent<typeof import("../components/admin/ImageUploadModal.vue")['default']>
    'LazyAdminRecordModal': LazyComponent<typeof import("../components/admin/RecordModal.vue")['default']>
    'LazyAdminStockDisplay': LazyComponent<typeof import("../components/admin/StockDisplay.vue")['default']>
    'LazyAdminStockManagement': LazyComponent<typeof import("../components/admin/StockManagement.vue")['default']>
    'LazyAdminStockOverview': LazyComponent<typeof import("../components/admin/StockOverview.vue")['default']>
    'LazyAdminToastNotifications': LazyComponent<typeof import("../components/admin/ToastNotifications.vue")['default']>
    'LazyAdminTransactionChart': LazyComponent<typeof import("../components/admin/TransactionChart.vue")['default']>
    'LazyNuxtWelcome': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
    'LazyNuxtLayout': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
    'LazyNuxtErrorBoundary': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
    'LazyClientOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
    'LazyDevOnly': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
    'LazyServerPlaceholder': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
    'LazyNuxtLink': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
    'LazyNuxtLoadingIndicator': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
    'LazyNuxtTime': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
    'LazyNuxtImg': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
    'LazyNuxtPicture': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
    'LazyNuxtPage': LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
    'LazyNoScript': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
    'LazyLink': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
    'LazyBase': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
    'LazyTitle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
    'LazyMeta': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
    'LazyStyle': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
    'LazyHead': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
    'LazyHtml': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
    'LazyBody': LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
    'LazyNuxtIsland': LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
    'LazyNuxtRouteAnnouncer': LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>
}

declare module 'vue' {
  export interface GlobalComponents extends _GlobalComponents { }
}

export const AddLicense: typeof import("../components/AddLicense.vue")['default']
export const AddProduct: typeof import("../components/AddProduct.vue")['default']
export const AppHeader: typeof import("../components/AppHeader.vue")['default']
export const AppHeaderCore: typeof import("../components/AppHeaderCore.vue")['default']
export const AuthModal: typeof import("../components/AuthModal.vue")['default']
export const CategoryCard: typeof import("../components/CategoryCard.vue")['default']
export const GoogleButton: typeof import("../components/GoogleButton.vue")['default']
export const InfoSection: typeof import("../components/InfoSection.vue")['default']
export const LogoutButton: typeof import("../components/LogoutButton.vue")['default']
export const MidtransStatusChecker: typeof import("../components/MidtransStatusChecker.vue")['default']
export const ProductCard: typeof import("../components/ProductCard.vue")['default']
export const ProfilePicture: typeof import("../components/ProfilePicture.vue")['default']
export const ToastNotifications: typeof import("../components/ToastNotifications.vue")['default']
export const AdminConfirmModal: typeof import("../components/admin/ConfirmModal.vue")['default']
export const AdminCustomSelect: typeof import("../components/admin/CustomSelect.vue")['default']
export const AdminImageUpload: typeof import("../components/admin/ImageUpload.vue")['default']
export const AdminImageUploadModal: typeof import("../components/admin/ImageUploadModal.vue")['default']
export const AdminRecordModal: typeof import("../components/admin/RecordModal.vue")['default']
export const AdminStockDisplay: typeof import("../components/admin/StockDisplay.vue")['default']
export const AdminStockManagement: typeof import("../components/admin/StockManagement.vue")['default']
export const AdminStockOverview: typeof import("../components/admin/StockOverview.vue")['default']
export const AdminToastNotifications: typeof import("../components/admin/ToastNotifications.vue")['default']
export const AdminTransactionChart: typeof import("../components/admin/TransactionChart.vue")['default']
export const NuxtWelcome: typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']
export const NuxtLayout: typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']
export const NuxtErrorBoundary: typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']
export const ClientOnly: typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']
export const DevOnly: typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']
export const ServerPlaceholder: typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']
export const NuxtLink: typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']
export const NuxtLoadingIndicator: typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']
export const NuxtTime: typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']
export const NuxtRouteAnnouncer: typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']
export const NuxtImg: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']
export const NuxtPicture: typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']
export const NuxtPage: typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']
export const NoScript: typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']
export const Link: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']
export const Base: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']
export const Title: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']
export const Meta: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']
export const Style: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']
export const Head: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']
export const Html: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']
export const Body: typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']
export const NuxtIsland: typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']
export const NuxtRouteAnnouncer: IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyAddLicense: LazyComponent<typeof import("../components/AddLicense.vue")['default']>
export const LazyAddProduct: LazyComponent<typeof import("../components/AddProduct.vue")['default']>
export const LazyAppHeader: LazyComponent<typeof import("../components/AppHeader.vue")['default']>
export const LazyAppHeaderCore: LazyComponent<typeof import("../components/AppHeaderCore.vue")['default']>
export const LazyAuthModal: LazyComponent<typeof import("../components/AuthModal.vue")['default']>
export const LazyCategoryCard: LazyComponent<typeof import("../components/CategoryCard.vue")['default']>
export const LazyGoogleButton: LazyComponent<typeof import("../components/GoogleButton.vue")['default']>
export const LazyInfoSection: LazyComponent<typeof import("../components/InfoSection.vue")['default']>
export const LazyLogoutButton: LazyComponent<typeof import("../components/LogoutButton.vue")['default']>
export const LazyMidtransStatusChecker: LazyComponent<typeof import("../components/MidtransStatusChecker.vue")['default']>
export const LazyProductCard: LazyComponent<typeof import("../components/ProductCard.vue")['default']>
export const LazyProfilePicture: LazyComponent<typeof import("../components/ProfilePicture.vue")['default']>
export const LazyToastNotifications: LazyComponent<typeof import("../components/ToastNotifications.vue")['default']>
export const LazyAdminConfirmModal: LazyComponent<typeof import("../components/admin/ConfirmModal.vue")['default']>
export const LazyAdminCustomSelect: LazyComponent<typeof import("../components/admin/CustomSelect.vue")['default']>
export const LazyAdminImageUpload: LazyComponent<typeof import("../components/admin/ImageUpload.vue")['default']>
export const LazyAdminImageUploadModal: LazyComponent<typeof import("../components/admin/ImageUploadModal.vue")['default']>
export const LazyAdminRecordModal: LazyComponent<typeof import("../components/admin/RecordModal.vue")['default']>
export const LazyAdminStockDisplay: LazyComponent<typeof import("../components/admin/StockDisplay.vue")['default']>
export const LazyAdminStockManagement: LazyComponent<typeof import("../components/admin/StockManagement.vue")['default']>
export const LazyAdminStockOverview: LazyComponent<typeof import("../components/admin/StockOverview.vue")['default']>
export const LazyAdminToastNotifications: LazyComponent<typeof import("../components/admin/ToastNotifications.vue")['default']>
export const LazyAdminTransactionChart: LazyComponent<typeof import("../components/admin/TransactionChart.vue")['default']>
export const LazyNuxtWelcome: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/welcome.vue")['default']>
export const LazyNuxtLayout: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-layout")['default']>
export const LazyNuxtErrorBoundary: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-error-boundary.vue")['default']>
export const LazyClientOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/client-only")['default']>
export const LazyDevOnly: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/dev-only")['default']>
export const LazyServerPlaceholder: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>
export const LazyNuxtLink: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-link")['default']>
export const LazyNuxtLoadingIndicator: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-loading-indicator")['default']>
export const LazyNuxtTime: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-time.vue")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-route-announcer")['default']>
export const LazyNuxtImg: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtImg']>
export const LazyNuxtPicture: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-stubs")['NuxtPicture']>
export const LazyNuxtPage: LazyComponent<typeof import("../node_modules/nuxt/dist/pages/runtime/page")['default']>
export const LazyNoScript: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['NoScript']>
export const LazyLink: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Link']>
export const LazyBase: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Base']>
export const LazyTitle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Title']>
export const LazyMeta: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Meta']>
export const LazyStyle: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Style']>
export const LazyHead: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Head']>
export const LazyHtml: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Html']>
export const LazyBody: LazyComponent<typeof import("../node_modules/nuxt/dist/head/runtime/components")['Body']>
export const LazyNuxtIsland: LazyComponent<typeof import("../node_modules/nuxt/dist/app/components/nuxt-island")['default']>
export const LazyNuxtRouteAnnouncer: LazyComponent<IslandComponent<typeof import("../node_modules/nuxt/dist/app/components/server-placeholder")['default']>>

export const componentNames: string[]
